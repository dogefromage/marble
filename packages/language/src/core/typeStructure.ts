import { FlowEnvironment, TypeSpecifier } from "../types";

export function resolveReferences(path: TypeTreePath, typeSpecifier: TypeSpecifier, env: FlowEnvironment): TypeSpecifier {
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
