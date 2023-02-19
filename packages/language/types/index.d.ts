export * from './node';
export * from './ast';

declare module '@marble/language' {
    declare function parse(inputCode: string): Program;
}