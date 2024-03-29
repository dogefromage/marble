import { Obj } from "./utilTypes";

export type Primitives = 'number' | 'boolean' | 'string';
export interface PrimitiveTypeSpecifier {
    type: 'primitive';
    primitive: Primitives;
}
export interface ListTypeSpecifier {
    type: 'list';
    elementType: TypeSpecifier; // all elements have same type
}
export interface ArrayTypeSpecifier {
    type: 'array';
    length: number;
    elementType: TypeSpecifier; // all elements have same type
}
export interface MapTypeSpecifier {
    type: 'map';
    elements: Obj<TypeSpecifier>;
}
export interface ReferenceTypeSpecifier {
    type: 'reference';
    name: string;
}
export interface UnknownTypeSpecifier {
    type: 'unknown';
}


export type TypeSpecifier =
    | ReferenceTypeSpecifier
    | UnknownTypeSpecifier
    | PrimitiveTypeSpecifier
    | MapTypeSpecifier
    | ListTypeSpecifier
    | ArrayTypeSpecifier

export type InitializerValue =
    | null
    | number
    | boolean
    | string
    | readonly InitializerValue[]
    | { [key: string]: InitializerValue }


export interface UniqueType<T extends TypeSpecifier = TypeSpecifier> {
    type: T;
    hash: number;
}
