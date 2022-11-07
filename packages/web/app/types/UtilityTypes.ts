
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
    Quaternion = 'Quaternion XYZW',
    Euler_XYZ = 'Euler XYZ',
    Euler_XZY = 'Euler XZY',
    Euler_YXZ = 'Euler YXZ',
    Euler_YZX = 'Euler YZX',
    Euler_ZXY = 'Euler ZXY',
    Euler_ZYX = 'Euler ZYX',
}

export type Tuple<T, N extends number> = N extends N ? number extends N ? T[] : _TupleOf<T, N, []> : never;
type _TupleOf<T, N extends number, R extends unknown[]> = R['length'] extends N ? R : _TupleOf<T, N, [T, ...R]>;