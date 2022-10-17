import { DataTypes } from "./sceneProgram";


export type ObjMap<T> =
{
    [ key: string ]: T;
}

export type Override<T, K extends keyof T, N> = Omit<T, K> & { [K1 in K]: N };

export interface Point
{
    x: number;
    y: number;
}

export type MapEvery<M extends string, T> = { [K in M]: T };

export interface Counter
{
    current: number;
}