import { CompoundStatementNode, DeclarationNode, DeclarationStatementNode, ExpressionNode, FullySpecifiedTypeNode, FunctionCallNode, FunctionHeaderNode, FunctionNode, FunctionPrototypeNode, IdentifierNode, KeywordNode, LambdaExpressionNode, LambdaTypeSpecifierNode, LiteralNode, ParameterDeclarationNode, ReturnStatementNode, SimpleTypeSpecifierNode, StatementNode, TypeSpecifierNode } from "@marble/language";
import produceNoFreeze from "../produceNoFreeze";

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
    public createDeclarationStatement(fullTypeSpec: FullySpecifiedTypeNode, declaration: DeclarationNode, semiWhitespace = '\n    ')  {
        const declarationStmt: DeclarationStatementNode = {
            type: 'declaration_statement',
            declaration: {
                type: 'declarator_list',
                specified_type: fullTypeSpec,
                declarations: [ declaration ],
                commas: [],
            },
            semi: this.createLiteral(';', semiWhitespace),
        }
        return produceNoFreeze(declarationStmt, d => {
            const specifier = d.declaration.specified_type.specifier;
            if (specifier.type === 'type_specifier') {
                specifier.specifier.whitespace = ' ';
            } else {
                specifier.rp.whitespace = ' ';
            }
        });
    }
    public createReturnStatement(expression: ExpressionNode): ReturnStatementNode {
        return {
            type: 'return_statement',
            return: this.createKeyword('return'),
            expression,
            semi: this.createLiteral(';', '\n'),
        };
    }
    public createTypeSpecifierNode(typeNameIdentifier: KeywordNode | IdentifierNode): TypeSpecifierNode {
        return {
            type: 'type_specifier',
            quantifier: null,
            specifier: typeNameIdentifier,
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
        const paramDeclarationDraft: ParameterDeclarationNode = {
            type: 'parameter_declaration',
            qualifier: [],
            declaration: {
                type: 'parameter_declarator',
                quantifier: null,
                identifier, specifier,
            }
        };
        return produceNoFreeze(paramDeclarationDraft, d => {
            if (d.declaration.type === 'parameter_declarator') {
                const declarator = d.declaration;
                declarator.identifier.whitespace = '';
                if (declarator.specifier.type === 'type_specifier') {
                    declarator.specifier.specifier.whitespace = ' ';
                } else {
                    declarator.specifier.rp.whitespace = ' ';
                }
            }
        });
    }
    public createFunctionCall(identifier: FunctionCallNode['identifier'], args: ExpressionNode[]): FunctionCallNode {
        return {
            type: 'function_call',
            identifier,
            lp: this.createLiteral('(', ''),
            rp: this.createLiteral(')', ''),
            args: this.placeCommas(args),
        }
    }
    public createLambdaExpression(name: string, parameters: ParameterDeclarationNode[], body: ExpressionNode): LambdaExpressionNode {
        return {
            type: 'lambda_expression',
            header: {
                type: 'lambda_expression_header',
                name,
                lambda: this.createKeyword('lambda'),
                colon: this.createLiteral(':'),
                lp: this.createLiteral('('),
                rp: this.createLiteral(')'),
                parameters,
            },
            body,
        }
    }
    public createLambdaTypeSpecifier(return_type: SimpleTypeSpecifierNode, args: SimpleTypeSpecifierNode[]): LambdaTypeSpecifierNode {
        // float:(vec3,vec4)
        return {
            type: 'lambda_type_specifier',
            return_type,
            colon: this.createLiteral(':', ''),
            lp: this.createLiteral('(', ''),
            args,
            rp: this.createLiteral(')', ''),
        }
    }
    public createCompoundStatement(statements: StatementNode[]): CompoundStatementNode {
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

    public getParameterIdentifiers(parameterDeclarationList?: ParameterDeclarationNode[]): [ TypeSpecifierNode, string | undefined ][] {
        if (!parameterDeclarationList) return [];
        return parameterDeclarationList
            .map(declaration => {
                const declarator = declaration.declaration;
                if (declarator.type === 'parameter_declarator') {
                    return [ 
                        declarator.specifier, 
                        declarator.identifier.identifier 
                    ];
                } else {
                    return [
                        declarator,
                        undefined,
                    ];
                }
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
                    statement.semi.whitespace = '\n' + spaces;
                    break;
            }
        }
    }
}

const ast = new AstUtils();
export default ast;