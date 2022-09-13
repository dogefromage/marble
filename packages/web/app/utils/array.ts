

export function arraySetNested(nested: Array<any>, item: any, ...indices: number[])
{
    let current = nested;

    while (indices.length > 1)
    {
        const index = indices.shift()!;
        current[index] = [];
        current = current[index];
    }

    current[indices.shift()!] = item;
}