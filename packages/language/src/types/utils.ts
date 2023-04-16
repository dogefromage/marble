
export interface Vec2 {
    x: number;
    y: number;
}

export type Obj<T> = Record<string, T>;

export interface Versionable {
    id: string;
    version: number;
}
