import * as ml from '@marble/language';
import { generate, parser } from '@shaderfrog/glsl-parser';
import { FunctionNode, ParameterDeclarationNode, PreprocessorNode, TypeSpecifierNode } from '@shaderfrog/glsl-parser/ast';
import { SourceTemplate } from './typings';

export class TemplateSheetParser {

    public templates: SourceTemplate[] = [];

    private currentColor = '#aa66aa';
    private currentCategory = 'other';
    private currentName = 'Unnamed';
    private currentOutTypes: ml.TypeSpecifier[] = [];
    private rowRecords: Record<string, Record<string, string>> = {};

    constructor(
        src: string
    ) {
        const ast = parser.parse(src, { quiet: true });
        for (const node of ast.program) {
            switch (node.type) {
                case 'preprocessor':
                    this.registerPreprocessor(node);
                    break;
                case 'function':
                    this.registerFunction(node);
                    break;
            }
        }
    }

    private registerPreprocessor(node: PreprocessorNode) {
        const commandMatch = /^\s*#\s*(\w+)(.*)/.exec(node.line);
        if (!commandMatch) return;
        const [_, command, argList] = commandMatch;
        const tokenizer = new MetadataTokenizer(argList);

        switch (command.toLocaleLowerCase()) {
            case 'category':
                this.currentCategory = tokenizer.expectSimple(`Expected category`).value;
                break;
            case 'name':
                this.currentName = tokenizer.expectSimple(`Expected name`).value;
                break;
            case 'color':
                this.currentColor = tokenizer.expectSimple(`Expected color`).value;
                break;
            case 'outtype':
                const types: string[] = [];
                do {
                    types.push(tokenizer.expectSimple('Expected output row type').value)
                }
                while (tokenizer.hasSimple());
                this.currentOutTypes = types.map(typeName => generateNamedSpecifier(typeName));
                break;
            case 'row':
                const rowId = tokenizer.expectSimple(`expected row id`).value;
                const rowData: Record<string, string> = {};
                while (tokenizer.hasMapped()) {
                    const entry = tokenizer.expectMapped(`Expected row data`);
                    rowData[entry.key] = entry.value;
                }
                this.rowRecords[rowId] = rowData;
                break;
        }
    }

    private registerFunction(funcNode: FunctionNode) {
        const functionId = funcNode.prototype.header.name.identifier;
        const paramNodes = funcNode.prototype.parameters || []
        const params = (paramNodes as ParameterDeclarationNode[])
            .filter(param => param.type === 'parameter_declaration')
            .map(param => {
                if (param.declaration.type === 'type_specifier') {
                    throw new Error(`Parameters must be named`);
                }
                return param.declaration;
            });

        const signature: ml.FlowSignature = {
            id: `internal:${functionId}`,
            name: this.currentName,
            description: '',
            // version: 0,
            attributes: {
                category: this.currentCategory,
                color: this.currentColor,
            },
            inputs: params.map(param => {
                const rowId = param.identifier.identifier;
                const rowRecord = this.rowRecords[rowId] || {};

                const rowType: ml.InputRowSignature['rowType'] = (rowRecord.rt as any) || 'input-simple';
                if (!ml.inputRowTypes.includes(rowType)) {
                    throw new Error(`"${rowType}" is not a valid input rowtype`);
                }

                if (rowType === 'input-variable') {
                    let defaultValue: ml.InitializerValue | null = null;
                    if (rowRecord.dv != null) {
                        try {
                            defaultValue = JSON.parse(rowRecord.dv);
                        } catch (e) {
                            throw new Error(`Could not parse default value: ${e}`);
                        }
                    }
                    const row: ml.VariableInputRowSignature = {
                        id: rowId,
                        label: rowRecord.n || rowId,
                        rowType: rowType,
                        dataType: parseTypeSpecifierNode(param.specifier),
                        defaultValue,
                    }
                    return row;
                } else {
                    return {
                        id: rowId,
                        label: rowRecord.n || rowId,
                        rowType: rowType,
                        dataType: parseTypeSpecifierNode(param.specifier),
                    }
                }
            }),
            outputs: this.currentOutTypes.map((outType, outIndex) => {
                const rowId = outIndex.toString();
                const rowRecord = this.rowRecords[rowId] || {};
                const rowType: any = rowRecord.rt || 'output';
                if (!ml.outputRowTypes.includes(rowType)) {
                    throw new Error(`"${rowType}" is not a valid output rowtype`);
                }

                return {
                    id: rowId,
                    label: rowRecord.n || rowId,
                    rowType,
                    dataType: outType,
                };
            }),
        };

        funcNode.body.rb.whitespace = '\n';
        const generatedFunction = generate(funcNode);

        this.templates.push({
            type: 'signature',
            signature,
            glsl: generatedFunction,
        });
    }
}

function parseTypeSpecifierNode(typeSpec: TypeSpecifierNode): ml.TypeSpecifier {
    let name: string | undefined;
    if (typeSpec.specifier.type === 'identifier') {
        name = typeSpec.specifier.identifier;
    }
    if (typeSpec.specifier.type === 'keyword') {
        name = typeSpec.specifier.token;
    }
    if (name == null) {
        throw new Error(`Unknown type ${typeSpec.specifier.type}`);
    }

    return generateNamedSpecifier(name);
}

function generateNamedSpecifier(name: string): ml.TypeSpecifier {
    if (name === 'float') {
        return ml.types.createPrimitive('number');
    }
    if (name === 'bool') {
        return ml.types.createPrimitive('boolean');
    }
    return ml.types.createReference(name);
}



type ArgumentToken =
    | { type: 'simple', value: string }
    | { type: 'mapped', key: string, value: string }


class MetadataTokenizer {
    private tokens: ArgumentToken[] = [];

    constructor(str: string) {
        const tokenStream: string[] = [];
        while (true) {
            let trimmedString = str.trimStart();
            const quotationMatch = /^\"(\\.|[^\"])*\"/.exec(trimmedString);
            if (quotationMatch) {
                const matchString = quotationMatch[0];
                let token = quotationMatch[0].slice(1, matchString.length - 1);
                token = token.replaceAll('\\"', "\"");
                str = trimmedString.slice(matchString.length); 
                tokenStream.push(token);
                continue;
            }
            const noQuotationMatch = /^[^\s]+/.exec(trimmedString);
            if (noQuotationMatch) {
                const token = noQuotationMatch[0];
                str = trimmedString.slice(token.length);
                tokenStream.push(token);
                continue;
            }
            break; // no match
        }

        while (tokenStream.length) {
            const currToken = tokenStream.shift()!;
            if (currToken.startsWith('-')) {
                const valueToken = tokenStream.shift()!;
                if (!valueToken) {
                    throw new Error(`No value passed`);
                }
                this.tokens.push({
                    type: 'mapped',
                    key: currToken.slice(1),
                    value: valueToken,
                })
            } else {
                this.tokens.push({
                    type: 'simple',
                    value: currToken,
                });
            }
        }
    }

    public hasSimple() {
        return this.isSimpleToken(this.tokens[0]);
    }
    public hasMapped() {
        return this.isMappedToken(this.tokens[0]);
    }
    public expectSimple(errMsg: string) {
        if (!this.hasSimple()) {
            throw new Error(errMsg)
        }
        return this.tokens.shift() as ArgumentToken & { type: 'simple' };
    }
    public expectMapped(errMsg: string) {
        if (!this.hasMapped()) {
            throw new Error(errMsg)
        }
        return this.tokens.shift() as ArgumentToken & { type: 'mapped' };
    }
    private isSimpleToken(token: ArgumentToken | undefined): token is ArgumentToken & { type: 'simple' } {
        return token?.type === 'simple';
    }
    private isMappedToken(token: ArgumentToken | undefined): token is ArgumentToken & { type: 'mapped' } {
        return token?.type === 'mapped';
    }
}
