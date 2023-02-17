import { IdentifierNode, FunctionPrototypeNode, CompoundStatementNode, TypeSpecifierNode, KeywordNode, LiteralNode } from "@shaderfrog/glsl-parser/ast";

export interface LambdaExpressionNode {
    type: 'lambda_expression';
    header: {
        type: 'lambda_expression_header';
        lambda: KeywordNode;
        lp: LiteralNode;
        parameters: FunctionPrototypeNode['parameters'];
        rp: LiteralNode;
        colon: LiteralNode;
        name: string;
    }
    body: any; // TODO expression type
}

export interface LambdaTypeSpecifierNode {
    type: 'lambda_type_specifier',
    return_type: IdentifierNode
    colon: LiteralNode;
    lp: LiteralNode;
    args: TypeSpecifierNode[];
    rp: LiteralNode;
}