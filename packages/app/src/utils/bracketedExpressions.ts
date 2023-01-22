
const OPENING = '({[';
const CLOSING = ')}]';

export function findClosingBracket (source: string, openingBracketIndex: number): number {

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
            s = s.substring(i+1);
            i = 0;
        }
    }
    chunks.push(s);
    return chunks;
}