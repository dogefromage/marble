import { parse as parseMarbleLanguage } from "@marble/language";
import { LiteralNode, IdentifierNode, KeywordNode, DeclarationNode, FullySpecifiedTypeNode, DeclarationStatementNode, ReturnStatementNode, TypeSpecifierNode, StructNode } from "@shaderfrog/glsl-parser/ast";
import { GeometryS, LambdaExpressionNode } from "../../types";
import { glsl } from "../codeStrings";
import produceNoFreeze from "../produceNoFreeze";
import { formatDataTypeText } from "./generateCodeStatements";

export default class AstUtils {
    public static createLiteral(literal: string, whitespace = ' '): LiteralNode {
        return { type: 'literal', literal, whitespace }
    }
    public static createIdentifier(identifier: string, whitespace = ' '): IdentifierNode {
        return { type: 'identifier', identifier, whitespace }
    }
    public static createKeyword(keyword: string, whitespace = ' '): KeywordNode {
        return { type: 'keyword', token: keyword, whitespace };
    }
    public static createDeclaration(identifier: string, expression: any): DeclarationNode {
        return {
            type: 'declaration',
            identifier: this.createIdentifier(identifier),
            quantifier: null,
            operator: this.createLiteral('='),
            initializer: expression,
        }
    }
    public static createDeclarationStatement(fullTypeSpec: FullySpecifiedTypeNode, declaration: DeclarationNode)  {
        const declarationStmt: DeclarationStatementNode = {
            type: 'declaration_statement',
            declaration: {
                type: 'declarator_list',
                specified_type: fullTypeSpec,
                declarations: [ declaration ],
                commas: [],
            },
            semi: this.createLiteral(';', '\n    '),
        }
        return produceNoFreeze(declarationStmt, d => {
            const identifier = d.declaration.specified_type.specifier.specifier;
            if (identifier) {
                identifier.whitespace = ' ';
            }
        });
    }
    public static createReturnStatement(expression: any): ReturnStatementNode {
        return {
            type: 'return_statement',
            return: this.createKeyword('return'),
            expression,
            semi: this.createLiteral(';', '\n'),
        };
    }
    public static createTypeSpecifierNode(typeNameIdentifier: KeywordNode | IdentifierNode): TypeSpecifierNode {
        return {
            type: 'type_specifier',
            quantifier: null,
            specifier: typeNameIdentifier,
        };
    }
    public static createFullySpecifiedType(typeSpecNode: TypeSpecifierNode): FullySpecifiedTypeNode {
        return {
            type: 'fully_specified_type',
            qualifiers: [],
            specifier: typeSpecNode,
        }
    }
    public static createParameterDeclaration(specifier: TypeSpecifierNode, identifier: IdentifierNode) {
        const paramDeclarationDraft = {
            type: 'parameter_declaration',
            qualifiers: [],
            declaration: {
                type: 'parameter_declarator',
                quantifier: null,
                identifier, specifier,
            }
        };
        return produceNoFreeze(paramDeclarationDraft, d => {
            d.declaration.identifier.whitespace = '';
            (d.declaration.specifier.specifier as IdentifierNode).whitespace = ' ';
        }) as any /* TODO */;
    }
    public static createFunctionCall(typeSpecifier: TypeSpecifierNode, argExpressions: any[]) {
        return {
            type: 'function_call',
            identifier: typeSpecifier,
            lp: this.createLiteral('(', ''),
            rp: this.createLiteral(')', ''),
            args: argExpressions,
        } as any /* TODO */
    }

    public static getParameterIdentifiers(parameterDeclarationList?: any[]): [ TypeSpecifierNode, string ][] {
        if (!parameterDeclarationList) return [];
        return parameterDeclarationList.map(node => [ 
            node.declaration.specifier, 
            node.declaration.identifier.identifier 
        ]);
    }
    public static createBlankGeometryProgram(geometry: GeometryS, methodName: string) {
        const [ outputRow ] = geometry.outputs;
        const returnType = formatDataTypeText(outputRow.dataType);
        const code = glsl`${returnType} ${methodName}() {\n}\n`; /* TODO args */
        const program = parseMarbleLanguage(code);
        return program;
    }
    public static createLambdaExpression(name: string, parameters: any[], body: any): LambdaExpressionNode {
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
    public static placeCommas(list: any[]) {
        const newList: any[] = [];
        for (let i = 0; i < list.length; i++) {
            if (i > 0) {
                newList.push(this.createLiteral(',', ' '));
            }
            newList.push(list[i]);
        }
        return newList;
    }
}
