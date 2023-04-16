import { Obj } from "./utils";

export type PrimitiveBoolean = 'bool';
export type PrimitiveFloat = 'float';
export type PrimitiveInteger = 'int';
export type Primitives = PrimitiveBoolean | PrimitiveFloat | PrimitiveInteger; // string?

export const primitiveTypeNames: Primitives[] = [ 'bool', 'float', 'int' ];

export interface PrimitiveTypeSpecifier<P extends Primitives = Primitives> {
    type: 'primitive';
    primitive: P;
}
export interface ListTypeSpecifier {
    type: 'list';
    elementType: TypeSpecifier; // all elements have same type
    length?: number;
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
    | ReferenceTypeSpecifier
    | UnknownTypeSpecifier
