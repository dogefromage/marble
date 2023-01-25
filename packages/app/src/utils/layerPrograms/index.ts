import { ProgramInclude } from "../../types";

function removeIndent(s: string, indent: number) {
    for (let i = 0; i < indent; i++) {
        const c = s.charAt(0);
        if (c != ' ') {
            break;
        }
        s = s.substring(1);
    }
    return s;
}

function getCurrentIndent(s: string) {
    const match = s.match(/^\s*/);
    return match?.[ 0 ].length || 0;
}

export function setBlockIndent(instructions: string, newIndent: number) {

    const lines = instructions
        .split('\n')
        .filter(lines => /^\s*$/.test(lines) === false);
    if (lines.length < 0) return '';

    const startIndent = getCurrentIndent(lines[ 0 ]);
    const newIndentString = ' '.repeat(newIndent);

    const unindentedLines = lines
        .map(line =>
            newIndentString + removeIndent(line, startIndent)
        );
    return unindentedLines.join('\n');
}

export function preprocessSource(
    source: string, 
    pattern: RegExp, 
    callback: (args: { source: string, index: number, length: number }) => string,
) {
    let start = 0;
    while (true) {
        const match = source.substring(start).match(pattern);
        if (match == null) break;
        source = callback({ source, index: start + match.index!, length: match[0].length });
        start += match.index! + match.length;
    }
    return source;
}

export function splitIncludesFromSource(source: string) {
    const matches = [ ...source.matchAll(/#\s*DEFINCLUDE\s+(\w+);/g) ];
    const includes: ProgramInclude[] = [];

    for (let i = matches.length - 1; i >= 0; i--) {

        const lastMatchIndex = matches[i].index!;
        const sourceStart = lastMatchIndex + matches[i][0].length; // add offset of marker preprocessor
        const includeSrc = source.substring(sourceStart);
        // reduce source
        source = source.substring(0, lastMatchIndex);

        includes.push({
            id: matches[i][1]!,
            source: includeSrc,
        });
    }

    return includes;
}