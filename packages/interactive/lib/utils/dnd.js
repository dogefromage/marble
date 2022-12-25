/**
 * https://stackoverflow.com/questions/28487352/dragndrop-datatransfer-getdata-empty
 *
 * "It works, but you might summon Cthulhu in the process."
 */
const UPPERCASE_PREFIX = '^{';
const UPPERCASE_SUFFIX = '}^';
function encodeUpperCase(str) {
    return str.replace(/([A-Z]+)/g, `${UPPERCASE_PREFIX}$1${UPPERCASE_SUFFIX}`);
}
function decodeUpperCase(str) {
    const escapeRegExp = (escape) => ['', ...escape.split('')].join('\\');
    return str.replace(new RegExp(`${escapeRegExp(UPPERCASE_PREFIX)}(.*?)${escapeRegExp(UPPERCASE_SUFFIX)}`, 'g'), (_, p1) => p1.toUpperCase());
}
export function setTransferData(e, tag, data) {
    const json = JSON.stringify({ tag, data });
    e.dataTransfer.setData(encodeUpperCase(json), "null");
}
export function getTransferData(e, tag) {
    const json = decodeUpperCase(e.dataTransfer.types[0] || '{}');
    try {
        const parsed = JSON.parse(json);
        if (parsed.tag === tag) {
            return parsed.data;
        }
    }
    catch (_a) {
        return undefined;
    }
}
//# sourceMappingURL=dnd.js.map