

function labelLine(line: string, index: number) {
    return index.toString().padStart(4, ' ') + " | " + line;
}

export function logCodeWithLinesProximity(code: string, focus: number, range: number) {
    const lines = code.split('\n');
    const labeledLines: string[] = [];
    for (let i = 1; i <= lines.length; i++) {
        if (focus - range <= i && i <= focus + range) {
            let line = labelLine(lines[i - 1], i);
            if (i == focus) {
                line += "   <<<<<<<<<<<<<<<<";
            }
            labeledLines.push(line);
        }
    }
    return labeledLines.join('\n');
}

export function logCodeWithLines(code: string) {
    const lines = code.split('\n');
    const labeledLines: string[] = [];
    for (let i = 1; i <= lines.length; i++) {
        labeledLines.push(labelLine(lines[i-1], i));
    }
    return labeledLines.join('\n');
}