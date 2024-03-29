
export type Obj<T> = { [ key: string ]: T };
export type ObjStrict<T> = { [ key: string ]: T };

export type NullArr<T> = (T | null)[];

export type Override<T, K extends keyof T, N> = Omit<T, K> & { [ K1 in K ]: N };

export interface Vec2 {
    x: number;
    y: number;
}

export interface Size {
    w: number;
    h: number;
}

export interface Rect {
    x: number;
    y: number;
    w: number;
    h: number;
}

export type ColorTuple = [ number, number, number ];

export type MapEvery<M extends string, T> = { [ K in M ]: T };

export type RotationModels = 'xyzw' | 'xyz';
export const rotationModelNames: MapEvery<RotationModels, string> = {
    'xyzw': 'Quaternion',
    'xyz':  'Euler XYZ',
};

export type Tuple<T, N extends number> = N extends N ? number extends N ? T[] : _TupleOf<T, N, []> : never;
type _TupleOf<T, N extends number, R extends unknown[]> = R[ 'length' ] extends N ? R : _TupleOf<T, N, [ T, ...R ]>;

export enum SelectionStatus {
    Nothing = 0,
    SelectedForeign = 1,
    Selected = 2,
}

export type IDObj = { id: string };
