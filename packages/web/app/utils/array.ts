

export function arrayRange(size: number)
{
    const arr = new Array(size);

    for (let i = 0; i < size; i++)
    {
        arr[i] = i;
    }

    return arr;
}