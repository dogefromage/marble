import { CompoundStatementNode, DeclarationNode, DeclarationStatementNode, FieldSelectionNode, FullySpecifiedTypeNode, FunctionCallNode, FunctionHeaderNode, FunctionNode, FunctionPrototypeNode, IdentifierNode, KeywordNode, LiteralNode, ParameterDeclarationNode, PostfixNode, QuantifierNode, ReturnStatementNode, StructDeclarationNode, StructNode, TypeSpecifierNode } from "@shaderfrog/glsl-parser/ast";

class AstUtils {
    public createLiteral(literal: string, whitespace = ''): LiteralNode {
        return { type: 'literal', literal, whitespace }
    }
    public createIdentifier(identifier: string, whitespace = ''): IdentifierNode {
        return { type: 'identifier', identifier, whitespace }
    }
    public createKeyword(keyword: string, whitespace = ''): KeywordNode {
        return { type: 'keyword', token: keyword, whitespace };
    }
    public createDeclaration(identifier: string, expression: any): DeclarationNode {
        return {
            type: 'declaration',
            identifier: this.createIdentifier(identifier, ' '),
            quantifier: null,
            operator: this.createLiteral('=', ' '),
            initializer: expression,
        }
    }
    public createDeclarationStatement(fullTypeSpec: FullySpecifiedTypeNode, declaration: DeclarationNode, semiWhitespace = '\n    ') {
        const declarationStmt: DeclarationStatementNode = {
            type: 'declaration_statement',
            declaration: {
                type: 'declarator_list',
                specified_type: fullTypeSpec,
                declarations: [declaration],
                commas: [],
            },
            semi: this.createLiteral(';', semiWhitespace),
        }
        if (declarationStmt.declaration.type === 'declarator_list') {
            this.addTypeSpecWhitespace(declarationStmt.declaration.specified_type.specifier);
        }
        return declarationStmt;
    }
    public createReturnStatement(expression: any): ReturnStatementNode {
        return {
            type: 'return_statement',
            return: this.createKeyword('return'),
            expression,
            semi: this.createLiteral(';', '\n'),
        };
    }
    public createTypeSpecifier(typeNameIdentifier: KeywordNode | IdentifierNode | StructNode, quantifier?: QuantifierNode): TypeSpecifierNode {
        return {
            type: 'type_specifier',
            specifier: typeNameIdentifier,
            quantifier: quantifier || null,
        };
    }
    public createQuantifier(expression: any): QuantifierNode {
        return {
            type: 'quantifier',
            lb: ast.createLiteral('['),
            expression,
            rb: ast.createLiteral(']'),
        };
    }
    public createFullySpecifiedType(typeSpecNode: TypeSpecifierNode): FullySpecifiedTypeNode {
        return {
            type: 'fully_specified_type',
            qualifiers: [],
            specifier: typeSpecNode,
        }
    }
    public createParameterDeclaration(specifier: TypeSpecifierNode, identifier: IdentifierNode): ParameterDeclarationNode {
        const paramDec: ParameterDeclarationNode = {
            type: 'parameter_declaration',
            qualifier: [],
            declaration: {
                type: 'parameter_declarator',
                quantifier: null,
                identifier, specifier,
            }
        };
        if (paramDec.declaration.type === 'parameter_declarator') {
            this.addTypeSpecWhitespace(paramDec.declaration.specifier);
        }
        return paramDec;
    }
    public createFunctionCall(identifier: FunctionCallNode['identifier'], argExpressions: any[]): FunctionCallNode {
        return {
            type: 'function_call',
            identifier,
            lp: this.createLiteral('(', ''),
            rp: this.createLiteral(')', ''),
            args: this.placeCommas(argExpressions),
        }
    }
    public createCompoundStatement(statements: any[]): CompoundStatementNode {
        return {
            type: 'compound_statement',
            lb: this.createLiteral('{', '\n'),
            rb: this.createLiteral('}', '\n'),
            statements,
        }
    }
    public createFunctionHeader(returnType: FullySpecifiedTypeNode, name: IdentifierNode): FunctionHeaderNode {
        return {
            type: 'function_header',
            returnType,
            name,
            lp: this.createLiteral('('),
        }
    }
    public createFunctionPrototype(header: FunctionHeaderNode, parameters: ParameterDeclarationNode[]): FunctionPrototypeNode {
        const commas = this
            .placeCommas(parameters)
            .filter(item => item.type === 'literal') as LiteralNode[];
        return {
            type: 'function_prototype',
            header,
            commas,
            parameters,
            rp: this.createLiteral(')', ' '),
        }
    }
    public createFunction(prototype: FunctionPrototypeNode, body: CompoundStatementNode): FunctionNode {
        return {
            type: 'function',
            prototype,
            body,
        }
    }
    public createStruct(typeName: IdentifierNode, declarations: StructDeclarationNode[]): StructNode {
        return {
            type: 'struct',
            declarations,
            typeName,
            struct: this.createKeyword('struct', ' '),
            lb: this.createLiteral('{', '\n    '),
            rb: this.createLiteral('}'),
        }
    }
    public createStructDefinition(struct: StructNode): DeclarationStatementNode {
        return {
            type: 'declaration_statement',
            declaration: struct,
            semi: this.createLiteral(';', '\n'),
        }
    }
    public createStructDeclaration(specifier: TypeSpecifierNode, identifier: IdentifierNode): StructDeclarationNode {
        return {
            type: 'struct_declaration',
            semi: this.createLiteral(';', '\n    '),
            declaration: {
                type: 'struct_declarator',
                declarations: [{
                    type: 'quantified_identifier',
                    quantifier: [],
                    identifier,
                }],
                commas: [],
                specified_type: {
                    type: 'fully_specified_type',
                    specifier,
                    qualifiers: [],
                },
            }
        }
    }
    public createPostfix(expression: any, postfix: FieldSelectionNode): PostfixNode {
        return {
            type: 'postfix',
            expression,
            postfix,
        }
    }
    public createFieldSelection(selection: LiteralNode): FieldSelectionNode {
        return {
            type: 'field_selection',
            dot: this.createLiteral('.'),
            selection,
        }
    }
    public addTypeSpecWhitespace(specifier: TypeSpecifierNode) {
        if (specifier.specifier.type !== 'struct') {
            specifier.specifier.whitespace = ' ';
        }
    }
    public getParameterIdentifiers(parameterDeclarationList?: ParameterDeclarationNode[]): [TypeSpecifierNode, string][] {
        if (!parameterDeclarationList) return [];
        return parameterDeclarationList
            .map(declaration => {
                const declarator = declaration.declaration;
                if (declarator.type !== 'parameter_declarator') {
                    throw new Error(`Unnamed params not allowed`);
                }

                return [
                    declarator.specifier,
                    declarator.identifier.identifier
                ];
            });
    }
    public placeCommas<T extends any>(list: T[]): (T | LiteralNode)[] {
        const newList: any[] = [];
        for (let i = 0; i < list.length; i++) {
            if (i > 0) {
                newList.push(this.createLiteral(',', ' '));
            }
            newList.push(list[i]);
        }
        return newList;
    }
    public correctIndent(compoundNode: CompoundStatementNode, ident: number, depth = 0) {
        const baseSpaces = ' '.repeat(ident * depth);
        const indentedSpaces = ' '.repeat(ident * (depth + 1));
        compoundNode.lb.whitespace = '\n' + indentedSpaces;
        compoundNode.rb.whitespace = '\n';
        for (let i = 0; i < compoundNode.statements.length; i++) {
            const spaces = i === compoundNode.statements.length - 1
                ? baseSpaces : indentedSpaces;
            const statement = compoundNode.statements[i];
            switch (statement.type) {
                case 'compound_statement':
                    this.correctIndent(statement, ident, depth + 1);
                    break;
                case 'break_statement':
                case 'continue_statement':
                case 'declaration_statement':
                case 'return_statement':
                case 'expression_statement':
                    statement.semi.whitespace = '\n' + spaces;
                    break;
            }
        }
    }
}

const ast = new AstUtils();
export default ast;