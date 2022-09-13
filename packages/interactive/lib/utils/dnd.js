"use strict";
/**
 * https://stackoverflow.com/questions/28487352/dragndrop-datatransfer-getdata-empty
 *
 * "It works, but you might summon Cthulhu in the process."
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTransferData = exports.setTransferData = void 0;
const UPPERCASE_PREFIX = '^{';
const UPPERCASE_SUFFIX = '}^';
function encodeUpperCase(str) {
    return str.replace(/([A-Z]+)/g, `${UPPERCASE_PREFIX}$1${UPPERCASE_SUFFIX}`);
}
function decodeUpperCase(str) {
    const escapeRegExp = (escape) => ['', ...escape.split('')].join('\\');
    return str.replace(new RegExp(`${escapeRegExp(UPPERCASE_PREFIX)}(.*?)${escapeRegExp(UPPERCASE_SUFFIX)}`, 'g'), (_, p1) => p1.toUpperCase());
}
function setTransferData(e, tag, data) {
    const json = JSON.stringify({ tag, data });
    e.dataTransfer.setData(encodeUpperCase(json), '');
}
exports.setTransferData = setTransferData;
function getTransferData(e, tag) {
    const json = decodeUpperCase(e.dataTransfer.types[0] || '{}');
    try {
        const parsed = JSON.parse(json);
        if (parsed.tag === tag)
            return parsed.data;
    }
    catch (_a) { }
}
exports.getTransferData = getTransferData;
// export function setTransferData<T>(e: React.DragEvent, key: string, data: T)
// {
//     let lastData: { [key: string]: any } = {};
//     let lastDataJSON = decodeUpperCase(e.dataTransfer.types[0] || '{}')
//     try
//     {
//         lastData = JSON.parse(lastDataJSON);
//     }
//     catch {};
//     lastData[key] = data;
//     e.dataTransfer.setData(encodeUpperCase(JSON.stringify(lastData)), '');
// }
// export function getTransferData<T>(e: React.DragEvent, key: string)
// {
//     let dataJSON = decodeUpperCase(e.dataTransfer.types[0] || '{}')
//     try
//     {
//         let data = JSON.parse(dataJSON);
//         if (data[key])
//         {
//             return data[key] as T;
//         }
//     }
//     catch {}
// }
//# sourceMappingURL=dnd.js.map