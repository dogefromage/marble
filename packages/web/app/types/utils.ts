

export type KeyValueMap<T> =
{
    [ key: string ]: T;
}

export type Override<T, K extends keyof T, N> = Omit<T, K> & { [K1 in K]: N };

export interface Point
{
    x: number;
    y: number;
}