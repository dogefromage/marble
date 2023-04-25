import { ArrayTypeSpecifier, FlowEnvironment, ListTypeSpecifier, MapTypeSpecifier, PrimitiveTypeSpecifier, TypeSpecifier } from "../types";
import { TypeTreePath, resolveReferences, GraphTypeException } from "./typeStructure";

export function compareTypes(gotten: TypeSpecifier, expected: TypeSpecifier, env: FlowEnvironment) {
    compareSwitch(new TypeTreePath(), gotten, expected, env);
}
function compareSwitch(path: TypeTreePath, gotten: TypeSpecifier, expected: TypeSpecifier, env: FlowEnvironment) {
    // both same reference
    if (gotten.type === 'reference' &&
        expected.type === 'reference' &&
        gotten.name === expected.name) {
        return;
    }

    gotten = resolveReferences(path, gotten, env);
    expected = resolveReferences(path, expected, env);

    if (gotten.type === 'unknown' || expected.type === 'unknown') {
        return;
    }

    if (gotten.type !== expected.type) {
        throw new GraphTypeException('type-mismatch', new TypeTreePath());
    }
    const pathWithType = path.add(gotten.type);
    switch (gotten.type) {
        case 'primitive':
            comparePrimitive(pathWithType, gotten, expected as PrimitiveTypeSpecifier, env);
            break;
        case 'list':
            compareList(pathWithType, gotten, expected as ListTypeSpecifier, env);
            break;
        case 'array':
            compareArray(pathWithType, gotten, expected as ArrayTypeSpecifier, env);
            break;
        case 'map':
            compareMap(pathWithType, gotten, expected as MapTypeSpecifier, env);
            break;
        default:
            throw new Error(`Unknown type "${(gotten as any).type}"`);
    }
}
function comparePrimitive(path: TypeTreePath, gotten: PrimitiveTypeSpecifier, expected: PrimitiveTypeSpecifier, env: FlowEnvironment) {
    if (gotten.primitive !== expected.primitive) {
        throw new GraphTypeException('type-mismatch', path.add('primitive'));
    }
}
function compareList(path: TypeTreePath, gotten: ListTypeSpecifier, expected: ListTypeSpecifier, env: FlowEnvironment) {
    compareSwitch(path.add('elementType'), gotten.elementType, expected.elementType, env);
}
function compareArray(path: TypeTreePath, gotten: ArrayTypeSpecifier, expected: ArrayTypeSpecifier, env: FlowEnvironment) {
    if (gotten.length !== expected.length) {
        throw new GraphTypeException('type-mismatch', path.add('length'));
    }
    compareSwitch(path.add('elementType'), gotten.elementType, expected.elementType, env);
}
function compareMap(basePath: TypeTreePath, gotten: MapTypeSpecifier, expected: MapTypeSpecifier, env: FlowEnvironment) {
    const elementsPath = basePath.add('elements');
    const gottenKeys = new Set(Object.keys(gotten.elements));
    for (const [expectedKey, expectedType] of Object.entries(expected)) {
        const expectedElementPath = elementsPath.add(expectedKey);
        const gottenType = gotten.elements[expectedKey];
        if (gottenType == null) {
            throw new GraphTypeException('missing-element', expectedElementPath);
        }
        compareSwitch(expectedElementPath, gottenType, expectedType, env);
        gottenKeys.delete(expectedKey);
    }
    if (gottenKeys.size > 0) {
        // wanted behaviour?
    }
}
