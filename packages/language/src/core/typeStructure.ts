import { ArrayTypeSpecifier, FlowEnvironment, InitializerValue, ListTypeSpecifier, MapTypeSpecifier, PrimitiveTypeSpecifier, TypeSpecifier } from "../types";
import { Obj } from "../types/utils";

export function compareTypes(gotten: TypeSpecifier, expected: TypeSpecifier, env: FlowEnvironment) {
    compareSwitch(new TypeTreePath(), gotten, expected, env);
}

function compareSwitch(path: TypeTreePath, gotten: TypeSpecifier, expected: TypeSpecifier, env: FlowEnvironment) {
    // both same reference
    if (gotten.type === 'reference' &&
        expected.type === 'reference' &&
        gotten.name === expected.name
    ) {
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

function resolveReferences(path: TypeTreePath, typeSpecifier: TypeSpecifier, env: FlowEnvironment): TypeSpecifier {
    if (typeSpecifier.type !== 'reference') {
        return typeSpecifier;
    }
    const envType = env.getType(typeSpecifier.name);
    const namedTypePath = path
        .add('reference')
        .add(typeSpecifier.name);
    if (!envType) {
        throw new GraphTypeException('unknown-reference', namedTypePath);
    }
    // TODO add recursion base case
    return resolveReferences(namedTypePath, envType, env);
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



export function validateValue(specifier: TypeSpecifier, value: InitializerValue, env: FlowEnvironment) {
    return _validateValue(new TypeTreePath(), specifier, value, env);
}
function _validateValue(path: TypeTreePath, specifier: TypeSpecifier, value: InitializerValue, env: FlowEnvironment) {
    specifier = resolveReferences(path, specifier, env);
    if (specifier.type === 'unknown') {
        return;
    }
    if (value == null) {
        throw new GraphTypeException('invalid-value', path);
    }

    if (specifier.type === 'primitive') {
        // ONLY WORKS BECAUSE PRIMITIVES HAVE SAME NAME AS JAVSCRIPT PRIMITIVES
        if (typeof value !== specifier.primitive) {
            throw new GraphTypeException('invalid-value', path.add('primitive').add(specifier.primitive));
        }
        return;
    }
    if (specifier.type === 'array') {
        const arrayPath = path.add('array');
        if (typeof value !== 'object' || !Array.isArray(value)) {
            throw new GraphTypeException('invalid-value', arrayPath);
        }
        if (value.length !== specifier.length) {
            throw new GraphTypeException('invalid-value', arrayPath.add('length'));
        }

        for (let i = 0; i < value.length; i++) {
            _validateValue(arrayPath.add(i.toString()), specifier.elementType, value[i], env);
        }
        return;
    }
    if (specifier.type === 'list') {
        const listPath = path.add('list');
        if (typeof value !== 'object' || !Array.isArray(value)) {
            throw new GraphTypeException('invalid-value', listPath);
        }
        for (let i = 0; i < value.length; i++) {
            _validateValue(listPath.add(i.toString()), specifier.elementType, value[i], env);
        }
        return;
    }
    if (specifier.type === 'map') {
        const mapPath = path.add('map');
        if (typeof value !== 'object' || Array.isArray(value)) {
            throw new GraphTypeException('invalid-value', mapPath);
        }
        for (const key of Object.keys(specifier.elements)) {
            const valueProp = (value as Obj<InitializerValue>)[key];
            _validateValue(mapPath.add(key), specifier.elements[key], valueProp, env);
        }
        return;
    }
    throw new Error(`Unhandled specifier ${specifier.type}`);
}



export function generateDefaultValue(specifier: TypeSpecifier, env: FlowEnvironment) {
    return _generateDefaultValue(new TypeTreePath(), specifier, env);
}
function _generateDefaultValue(path: TypeTreePath, specifier: TypeSpecifier, env: FlowEnvironment): InitializerValue {
    specifier = resolveReferences(path, specifier, env);
    if (specifier.type === 'unknown') {
        return null;
    }
    if (specifier.type === 'primitive') {
        if (specifier.primitive === 'boolean') {
            return false;
        }
        if (specifier.primitive === 'number') {
            return 0;
        }
        if (specifier.primitive === 'string') {
            return '';
        }
        throw new Error(`Unknown primitive ${specifier.primitive}`);
    }
    if (specifier.type === 'array') {
        const elementValue = _generateDefaultValue(path.add('array'), specifier.elementType, env);
        const arr = new Array(specifier.length).fill(elementValue);
        return Object.freeze(arr);
    }
    if (specifier.type === 'list') {
        return Object.freeze([]);
    }
    if (specifier.type === 'map') {
        const mapPath = path.add('map');
        const valueEntries = Object
            .entries(specifier.elements)
            .map(([key, valueType]) => {
                const propPath = mapPath.add(key);
                return [key, _generateDefaultValue(propPath, valueType, env)];
            });
        return Object.freeze(Object.fromEntries(valueEntries));
    }
    throw new Error(`Unhandled specifier ${specifier.type}`);
}



export class TypeTreePath {
    constructor(
        private path: string[] = []
    ) {}

    public add(element: string) {
        return new TypeTreePath([...this.path, element]);
    }

    public toArray() {
        return this.path.slice();
    }
}

export type GraphTypeExceptionType = 'type-mismatch' | 'missing-element' | 'unknown-reference' | 'invalid-value';
export class GraphTypeException extends Error {
    constructor(
        public type: GraphTypeExceptionType,
        public path: TypeTreePath,
    ) {
        super(type);
    }

    toString() {
        return [
            `Type validation exception: ${this.type} @`,
            this.path.toString(),
        ].join('\n');
    }
}
