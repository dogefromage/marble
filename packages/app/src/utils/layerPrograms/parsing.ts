import { parse } from "@marble/language";
import { FunctionNode } from "@shaderfrog/glsl-parser/ast";

export function parseTemplateInstructions(functionCode: string) {
    const program = parse(functionCode);
    const func = program.program[0] as FunctionNode;
    if (func.type !== 'function') {
        throw new Error(`Input program must contain a single method`);
    }
    return func;
}