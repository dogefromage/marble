
/**
 * https://stackoverflow.com/questions/28487352/dragndrop-datatransfer-getdata-empty
 * 
 * "It works, but you might summon Cthulhu in the process."
 */

const UPPERCASE_PREFIX = '^{';
const UPPERCASE_SUFFIX = '}^';

function encodeUpperCase(str: string) 
{
    return str.replace(/([A-Z]+)/g, `${UPPERCASE_PREFIX}$1${UPPERCASE_SUFFIX}`);
}

function decodeUpperCase(str: string): string 
{
    const escapeRegExp = (escape: string) => ['', ...escape.split('')].join('\\');

    return str.replace(
        new RegExp(`${escapeRegExp(UPPERCASE_PREFIX)}(.*?)${escapeRegExp(UPPERCASE_SUFFIX)}`, 'g'),
            (_, p1: string) => p1.toUpperCase()
    );
}

export function setTransferData<T>(e: React.DragEvent, tag: string, data: T)
{
    const json = JSON.stringify({ tag, data });

    e.dataTransfer.setData(encodeUpperCase(json), '');
}

export function getTransferData<T>(e: React.DragEvent, tag: string)
{
    const json = decodeUpperCase(e.dataTransfer.types[0] || '{}')

    try
    {
        const parsed = JSON.parse(json);
        if (parsed.tag === tag) return parsed.data as T;
    }
    catch {}
}

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
