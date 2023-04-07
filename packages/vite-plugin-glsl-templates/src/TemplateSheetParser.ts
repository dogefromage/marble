import { parser, generate } from '@shaderfrog/glsl-parser';
import { FunctionNode, ParameterDeclarationNode, PreprocessorNode, TypeSpecifierNode, KeywordNode, IdentifierNode, StructNode } from '@shaderfrog/glsl-parser/ast';
import { SourceTemplate } from './typings';
import { FunctionSignature, TypeSpecifier } from '@marble/language';

export class TemplateSheetParser {

    public templates: SourceTemplate[] = [];

    private currentColor = '#aa66aa';
    private currentCategory = 'other';
    private currentName = 'Unnamed';

    constructor(
        src: string
    ) {
        const ast = parser.parse(src);
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
        const [ _, command, ...args ] = node.line.split(/\s+/);

        switch (command) {
            case 'category':
                const [ category ] = args;
                this.currentCategory = category;
                break;
            case 'color':
                const [ color ] = args;
                this.currentColor = color;
                break;
            case 'name':
                const [ name ] = args;
                this.currentName = name;
                break;
            default: 
                throw new Error(`Unknown preprocessor keyword "${command}" in line "${node.line}"`);
        }
    }

    private registerFunction(funcNode: FunctionNode) {
        const functionId = funcNode.prototype.header.name.identifier;
        const functionReturnType = funcNode.prototype.header.returnType.specifier;
        const params = (funcNode.prototype.parameters as ParameterDeclarationNode[])
            .filter(param => param.type === 'parameter_declaration')
            .map(param => {
                if (param.declaration.type === 'type_specifier') {
                    throw new Error(`Parameters must be named`);
                }
                return param.declaration;
            });

        const signature: FunctionSignature = {
            id: `internal:${functionId}`,
            name: this.currentName,
            version: 0,
            attributes: {
                category: this.currentCategory,
                color: this.currentColor,
            },
            inputs: params.map(param => {
                return {
                    id: param.identifier.identifier,
                    label: param.identifier.identifier,
                    rowType: 'input-simple',
                    dataType: parseDataType(param.specifier),
                }
            }),
            outputs: [
                {
                    id: 'output',
                    label: 'Output',
                    rowType: 'output',
                    dataType: parseDataType(functionReturnType),
                }
            ]
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


function parseDataType(typeSpec: TypeSpecifierNode): TypeSpecifier {
    if (typeSpec.specifier.type === 'identifier') {
        return { type: 'atomic', atom: typeSpec.specifier.identifier };
    }
    if (typeSpec.specifier.type === 'keyword') {
        return { type: 'atomic', atom: typeSpec.specifier.token };
    }
    throw new Error(`Unknown type ${typeSpec.specifier.type}`);
}