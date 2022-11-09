
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

export enum RotationModels
{
    Quaternion = 'Quaternion',
    Euler_XYZ = 'XYZ Euler',
    // Euler_XZY = 'XZY Euler',
    // Euler_YXZ = 'YXZ Euler',
    // Euler_YZX = 'YZX Euler',
    // Euler_ZXY = 'ZXY Euler',
    // Euler_ZYX = 'ZYX Euler',
}

export type Tuple<T, N extends number> = N extends N ? number extends N ? T[] : _TupleOf<T, N, []> : never;
type _TupleOf<T, N extends number, R extends unknown[]> = R['length'] extends N ? R : _TupleOf<T, N, [T, ...R]>;