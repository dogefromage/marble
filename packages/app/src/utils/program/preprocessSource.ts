
export default function (
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