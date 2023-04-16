import { FlowEnvironment, ListTypeSpecifier, MapTypeSpecifier, PrimitiveTypeSpecifier, TypeSpecifier } from "../types";

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

export type GraphTypeExceptionType = 'type-mismatch' | 'missing-element' | 'unknown-reference';
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

export function compareTypes(gotten: TypeSpecifier, expected: TypeSpecifier, env: FlowEnvironment) {
    compareSwitch(new TypeTreePath(), gotten, expected, env);
}

function compareSwitch(path: TypeTreePath, gotten: TypeSpecifier, expected: TypeSpecifier, env: FlowEnvironment) {
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
        // add logic here if passing too many keys should throw an error
    }
}