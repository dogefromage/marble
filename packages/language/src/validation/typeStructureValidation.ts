import { AtomicTypeSpecifier, ListTypeSpecifier, MapTypeSpecifier, TypeSpecifier } from "../types";

export class TypeTreePath {
    constructor(
        private path: string[] = [],
    ) {}

    public add(element: string) {
        return new TypeTreePath([...this.path, element]);
    }

    public toString() {
        const lines: string[] = [];
        for (let i = 0; i < this.path.length; i++) {
            lines.push(
                ' '.repeat(i) + this.path[i],
            )
        }
        return lines.join('\n');
    }
}

export type GraphTypeExceptionType = 'type-mismatch' | 'missing-element';
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

export function compareTypes(gotten: TypeSpecifier, expected: TypeSpecifier) {
    compareSwitch(new TypeTreePath(), gotten, expected);
}

function compareSwitch(path: TypeTreePath, gotten: TypeSpecifier, expected: TypeSpecifier) {
    if (gotten.type !== expected.type) {
        throw new GraphTypeException('type-mismatch', new TypeTreePath());
    }
    const pathWithType = path.add(gotten.type);
    switch (gotten.type) {
        case 'atomic':
            compareAtomic(pathWithType, gotten, expected as AtomicTypeSpecifier);
            break;
        // case 'function':
        //     compareFunction(pathWithType, gotten, expected as FunctionTypeSpecifier);
            break;
        case 'list':
            compareList(pathWithType, gotten, expected as ListTypeSpecifier);
            break;
        case 'map':
            compareMap(pathWithType, gotten, expected as MapTypeSpecifier);
            break;
        default:
            throw new Error(`Unknown type "${(gotten as any).type}"`);
    }
}

function compareAtomic(path: TypeTreePath, gotten: AtomicTypeSpecifier, expected: AtomicTypeSpecifier) {
    if (gotten.atom !== expected.atom) {
        throw new GraphTypeException('type-mismatch', path.add('atom'));
    }
}

function compareList(path: TypeTreePath, gotten: ListTypeSpecifier, expected: ListTypeSpecifier) {
    compareSwitch(path.add('elementType'), gotten.elementType, expected.elementType);
}

function compareMap(basePath: TypeTreePath, gotten: MapTypeSpecifier, expected: MapTypeSpecifier) {
    const elementsPath = basePath.add('elements');
    const gottenKeys = new Set(Object.keys(gotten.elements));
    for (const [expectedKey, expectedType] of Object.entries(expected)) {
        const expectedElementPath = elementsPath.add(expectedKey);
        const gottenType = gotten.elements[expectedKey];
        if (gottenType == null) {
            throw new GraphTypeException('missing-element', expectedElementPath);
        }
        compareSwitch(expectedElementPath, gottenType, expectedType);
        gottenKeys.delete(expectedKey);
    }
    if (gottenKeys.size > 0) {
        // add logic here if passing too many keys should throw an error
    }
}

// function compareFunction(path: TypeTreePath, gotten: FunctionTypeSpecifier, expected: FunctionTypeSpecifier) {
//     compareMap(path.add('parameterMap'), gotten.parameterMap, expected.parameterMap);
//     compareMap(path.add('outputMap'), gotten.outputMap, expected.outputMap);
// }