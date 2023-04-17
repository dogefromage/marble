
export function assert<T>(element: T | null | undefined, msg?: string) {
    if (element == null) {
        throw new Error(msg || `Not defined`);
    }
    return element;
}

export function wrapDefined<T>(...items: T[]) {
    return items.filter(item => item != null) as NonNullable<T>[];
}