

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
    return match?.[0].length || 0;
}

export default function (instructions: string, newIndent: number) {

    const lines = instructions
        .split('\n')
        .filter(lines => /^\s*$/.test(lines) === false);
    if (lines.length < 0) return '';

    const startIndent = getCurrentIndent(lines[0]);
    const newIndentString = ' '.repeat(newIndent);

    const unindentedLines = lines
        .map(line => 
            newIndentString + removeIndent(line, startIndent)
        );
    return unindentedLines.join('\n');
}