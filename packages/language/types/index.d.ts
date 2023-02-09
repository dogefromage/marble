import { Program } from "@shaderfrog/glsl-parser/ast";

declare module '@marble/language' {
    declare function parse(inputCode: string): Program;
}