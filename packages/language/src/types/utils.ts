
export interface Vector2 {
    x: number;
    y: number;
}

export type Obj<T> = { [ key: string ]: T };

export interface Versionable {
    id: string;
    version: number;
}
