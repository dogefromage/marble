import { AstNode, Program } from "@shaderfrog/glsl-parser/ast";

type Definition =
    | { type: 'value', value: any }
    | { type: 'function', value: any }

type Scope = Map<string, Definition>;

export class Interpreter {

    private scopes: Scope[] = [];

    constructor() {}

    loadAst(astProgram: Program) {
        console.log(astProgram);
    }

    interpret(expression: AstNode) {

    }
}