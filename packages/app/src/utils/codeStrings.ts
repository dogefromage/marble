import { v4 as uuidv4 } from "uuid";

export class CodeTemplate {
    constructor(
        private templateCode: string
    ) { }

    replace(searchValue: string, replacementValue: string) {
        if (!this.templateCode.includes(searchValue))
            throw new Error(`Search value "${searchValue}" is not in template code`);

        this.templateCode = this.templateCode
            .replace(searchValue, replacementValue);
    }

    getFinishedCode(templateTester?: RegExp) {
        if (templateTester && templateTester.test(this.templateCode))
            throw new Error(`Generated code contains templates`);

        return this.templateCode;
    }
}

const OPENING = '({[';
const CLOSING = ')}]';

export function findClosingBracket(source: string, openingBracketIndex: number): number {
    const startIndex = OPENING.indexOf(source.charAt(openingBracketIndex));
    if (startIndex < 0) {
        throw new Error(`Start of string must be bracket`);
    }
    const brackets = [ startIndex ];

    for (let i = openingBracketIndex + 1; i < source.length; i++) {
        const c = source.charAt(i);
        if (OPENING.includes(c)) {
            brackets.push(OPENING.indexOf(c));
        }
        else if (CLOSING.includes(c)) {
            if (CLOSING.indexOf(c) != brackets.at(-1)) {
                const sub = source.substring(i, Math.min(i + 10, source.length));
                throw new Error(`Closing bracket doesn't match opening bracket: here --> ${sub}`);
            }
            brackets.pop();
        }

        if (brackets.length === 0) {
            return i;
        }
    }

    return -1; // not closed
}

export function splitBracketSafe(s: string, char: string) {
    if (char.length != 1) {
        throw new Error(`Char must be 1 character long`);
    }
    const chunks: string[] = [];
    for (let i = 0; i < s.length; i++) {
        const c = s.charAt(i);
        if (OPENING.includes(c)) {
            i = 1 + findClosingBracket(s, i);
        }
        if (c === char) {
            chunks.push(s.substring(0, i));
            s = s.substring(i + 1);
            i = 0;
        }
    }
    chunks.push(s);
    return chunks;
}

export const glsl = (stringArr: TemplateStringsArray, ...values: any[]) => 
    String.raw({ raw: stringArr }, ...values);

/**
 * Throws error if fails
 */
export function splitFirst(input: string, searchValue: RegExp | string) {
    const match = input.match(searchValue);
    if (match?.index == null) {
        throw new Error(`String cannot be split by searchValue`);
    }
    return [
        input.substring(0, match.index!),
        input.substring(match.index! + match[0].length),
    ];
}

// export function generateCodeSafeUUID() {
//     const id = uuidv4();
//     return id.replaceAll('-', '_');
// }

export function formatVariable(word: string) {
    if (!word.length) return word;
    word = word.replaceAll('_', ' ');
    return word.charAt(0).toUpperCase() + word.slice(1);
}