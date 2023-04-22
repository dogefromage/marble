import { Obj } from "./utils";

export interface PrimitiveTypeSpecifier {
    type: 'primitive';
    primitive: 'number' | 'boolean' | 'string';
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
    | PrimitiveTypeSpecifier
    | MapTypeSpecifier
    | ListTypeSpecifier
    | ArrayTypeSpecifier
    | ReferenceTypeSpecifier
    | UnknownTypeSpecifier

export type InitializerValue =
    | null
    | number
    | boolean
    | string
    | readonly InitializerValue[]
    | { [key: string]: InitializerValue }
