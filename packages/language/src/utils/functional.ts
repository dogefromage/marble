import { deepFreeze } from '.';
import { crudeHash, hashIntSequence } from './hashing';

// function sameValueZero(x: any, y: any) {
//     return x === y || (Number.isNaN(x) && Number.isNaN(y));
// }

// const shallowArrayEqualTo = (a: any) => (b: any) => {
//     return Array.isArray(a) && Array.isArray(b)
//         && a.length === b.length
//         && a.every((val, index) => {
//             return sameValueZero(val, b[index]);
//         });
// };
// const list = (...args: any[]) => args;

// class ShallowArrayCache extends Map {
//     delete(key: any) {
//         const keys = Array.from(this.keys());
//         const foundKey = keys.find(shallowArrayEqualTo(key));
//         return super.delete(foundKey);
//     }
//     get(key: any) {
//         const keys = Array.from(this.keys());
//         const foundKey = keys.find(shallowArrayEqualTo(key));
//         return super.get(foundKey);
//     }
//     has(key: any) {
//         const keys = Array.from(this.keys());
//         return keys.findIndex(shallowArrayEqualTo(key)) !== -1;
//     }
// }

// export const memFunction = (fn: (...args: any) => any) => {
//     const { Cache: OriginalCache } = _.memoize;
//     _.memoize.Cache = ShallowArrayCache;
//     const memoized = _.memoize(fn, list);
//     _.memoize.Cache = OriginalCache;
//     return memoized;
// };

export function memoizeMulti<F extends (...args: any[]) => any>(fn: F) {
    const memoized = (...args: any[]) => {
        const key = hashIntSequence(args.map(a => crudeHash(a)));
        const cache = memoized.cache;
        if (cache.has(key)) {
            return cache.get(key)
        }
        const result = fn(...args);
        cache.set(key, result);
        return result;
    }
    memoized.cache = new Map();
    return memoized as any as F;
}


export function freezeResult<F extends (...args: any[]) => any>(fn: F) {
    return ((...args: any[]) => {
        const res = fn(...args);
        deepFreeze(res);
        return res;
    }) as F;
}

export const always = <T>(v: T) => () => v;