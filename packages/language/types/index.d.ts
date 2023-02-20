export * from './node';
export * from './ast';

import { Program } from './ast';

declare module '@marble/language' {
    declare function parse(inputCode: string, options?: { quiet?: boolean }): Program;
}