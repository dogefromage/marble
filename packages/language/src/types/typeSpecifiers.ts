import { Obj } from "./utils";

export interface AtomicTypeSpecifier {
    type: 'atomic';
    atom: string;
}
export interface ListTypeSpecifier {
    type: 'list';
    elementType: TypeSpecifier; // all elements have same type
}
export interface MapTypeSpecifier {
    type: 'map';
    elements: Obj<TypeSpecifier>;
}
// export interface FunctionTypeSpecifier {
//     type: 'function';
//     parameterMap: MapTypeSpecifier;
//     outputMap: MapTypeSpecifier;
// }
// export interface ReferenceTypeSpecifier {
//     type: 'reference';
//     name: string;
// }
export type TypeSpecifier =
    | AtomicTypeSpecifier
    | MapTypeSpecifier
    | ListTypeSpecifier
    // | FunctionTypeSpecifier
    // | ReferenceTypeSpecifier
