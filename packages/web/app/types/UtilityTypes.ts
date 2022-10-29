
export type ObjMap<T> =
{
    [ key: string ]: T;
}

export type Override<T, K extends keyof T, N> = Omit<T, K> & { [ K1 in K ]: N };

export interface Point
{
    x: number;
    y: number;
}

export interface Rect
{ 
    x: number;
    y: number;
    w: number;
    h: number;
}

export type MapEvery<M extends string, T> = { [ K in M ]: T };

export interface Counter
{
    current: number;
}