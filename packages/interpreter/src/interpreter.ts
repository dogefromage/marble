import { AstNode, BinaryNode, DeclarationNode, ExpressionStatementNode, IfStatementNode, Program } from "@shaderfrog/glsl-parser/ast";
import fs from 'fs';
import path from 'path';

type IterationStatementNode = never;
type JumpStatementNode = never;

type SimpleStatementNode =
    | DeclarationNode
    | ExpressionStatementNode
    | IfStatementNode
    | IterationStatementNode
    | JumpStatementNode

class NodeNotFoundError extends Error {
    constructor(nodeType: string) {
        super(`Node type ${nodeType} not found.`);
    }
}

export class Interpreter {

    private astProgram!: Program;

    constructor() {}

    loadAst(astProgram: Program) {
        this.astProgram = astProgram;

        const json = JSON.stringify(astProgram, undefined, 4);
        fs.writeFileSync(path.resolve('./ast.json'), json);
    }

    public interpretSimpleStatement(node: SimpleStatementNode) {
        switch (node.type) {
            case 'declaration':
                return this.interpretDeclaration(node);
            case 'expression_statement':
                return this.interpretExpressionStatement(node);
            case 'if_statement':
                return this.interpretIfStatement(node);
            default:
                throw new NodeNotFoundError((node as AstNode).type);
        }
    }

    private interpretDeclaration(node: DeclarationNode) {
        // https://docs.nvidia.com/drive/archive/5.1.0.2L/nvvib_docs/DRIVE_OS_Linux_SDK_Development_Guide/baggage/GLSL_ES_Specification_3.20.withchanges.pdf
    }

    private interpretExpressionStatement(node: ExpressionStatementNode) {

    }

    private interpretIfStatement(node: IfStatementNode) {

    }


    private interpretBinary(expression: BinaryNode) {

    }
}