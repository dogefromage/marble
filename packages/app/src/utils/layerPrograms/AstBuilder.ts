import { AstNode, CompoundStatementNode, DeclarationNode, FunctionCallNode, FunctionNode, IdentifierNode, LambdaExpressionNode, ParameterDeclarationNode, SimpleTypeSpecifierNode } from "@marble/language";
import { AstNode as AstNodeShaderfrog, NodeVisitor, Path, visit } from "@shaderfrog/glsl-parser/ast";
import { TEXTURE_LOOKUP_METHOD_NAME } from "../../content/shaderTemplates";
import { arrayDifference } from "../arrays";
import { isIntegerString } from "../math";

const glslBuiltIns = new Set([
    'abs', 'acos', 'acosh', 'all', 'any', 'asin', 'asinh', 'atan', 'atanh', 'atomicAdd', 'atomicAnd', 'atomicCompSwap', 'atomicCounter', 'atomicCounterDecrement', 'atomicCounterIncrement', 'atomicExchange', 'atomicMax', 'atomicMin', 'atomicOr', 'atomicXor', 'barrier', 'bitCount', 'bitfieldExtract', 'bitfieldInsert', 'bitfieldReverse', 'ceil', 'clamp', 'cos', 'cosh', 'cross', 'degrees', 'determinant', 'dFdx', 'dFdxCoarse', 'dFdxFine', 'dFdy', 'dFdyCoarse', 'dFdyFine', 'distance', 'dot', 'EmitStreamVertex', 'EmitVertex', 'EndPrimitive', 'EndStreamPrimitive', 'equal', 'exp', 'exp2', 'faceforward', 'findLSB', 'findMSB', 'floatBitsToInt', 'floatBitsToUint', 'floor', 'fma', 'fract', 'frexp', 'fwidth', 'fwidthCoarse', 'fwidthFine', 'greaterThan', 'greaterThanEqual', 'groupMemoryBarrier', 'imageAtomicAdd', 'imageAtomicAnd', 'imageAtomicCompSwap', 'imageAtomicExchange', 'imageAtomicMax', 'imageAtomicMin', 'imageAtomicOr', 'imageAtomicXor', 'imageLoad', 'imageSamples', 'imageSize', 'imageStore', 'imulExtended', 'intBitsToFloat', 'interpolateAtCentroid', 'interpolateAtOffset', 'interpolateAtSample', 'inverse', 'inversesqrt', 'isinf', 'isnan', 'ldexp', 'length', 'lessThan', 'lessThanEqual', 'log', 'log2', 'matrixCompMult', 'max', 'memoryBarrier', 'memoryBarrierAtomicCounter', 'memoryBarrierBuffer', 'memoryBarrierImage', 'memoryBarrierShared', 'min', 'mix', 'mod', 'modf', 'noise', 'noise1', 'noise2', 'noise3', 'noise4', 'normalize', 'not', 'notEqual', 'outerProduct', 'packDouble2x32', 'packHalf2x16', 'packSnorm2x16', 'packSnorm4x8', 'packUnorm', 'packUnorm2x16', 'packUnorm4x8', 'pow', 'radians', 'reflect', 'refract', 'round', 'roundEven', 'sign', 'sin', 'sinh', 'smoothstep', 'sqrt', 'step', 'tan', 'tanh', 'texelFetch', 'texelFetchOffset', 'texture', 'textureGather', 'textureGatherOffset', 'textureGatherOffsets', 'textureGrad', 'textureGradOffset', 'textureLod', 'textureLodOffset', 'textureOffset', 'textureProj', 'textureProjGrad', 'textureProjGradOffset', 'textureProjLod', 'textureProjLodOffset', 'textureProjOffset', 'textureQueryLevels', 'textureQueryLod', 'textureSamples', 'textureSize', 'transpose', 'trunc', 'uaddCarry', 'uintBitsToFloat', 'umulExtended', 'unpackDouble2x32', 'unpackHalf2x16', 'unpackSnorm2x16', 'unpackSnorm4x8', 'unpackUnorm', 'unpackUnorm2x16', 'unpackUnorm4x8', 'usubBorrow', // GLSL ES 1.00 'texture2D', 'textureCube'
]);
const marbleBuiltIns = new Set([
    'Distance', TEXTURE_LOOKUP_METHOD_NAME,
]);
const marblePrefixes = new Set([
    'geo_', 'inc_', 'Tuple_',
]);

// type SymbolType = 'function' | 'var';
type SymbolNode = IdentifierNode | DeclarationNode | ParameterDeclarationNode | FunctionCallNode | FunctionNode;
type ScopeNode = FunctionNode | CompoundStatementNode | LambdaExpressionNode /* add more */;

interface Symbol {
    // type: SymbolType;
    initializer: SymbolNode | null;
    references: Set<SymbolNode>;
}

interface Scope {
    name: string;
    symbols: Map<string, Symbol>;
    parent: Scope | null;
    descendants: Set<Scope>;
    initializer: ScopeNode | null;
}

interface EditInstance {
    proxyToOriginal: WeakMap<object, object>;
    originalToProxy: WeakMap<object, object>;
    nodeScopes: WeakMap<object, Scope>;
}

export class AstBuilder<T extends AstNode> {

    private static editInstance: EditInstance | null = null;

    private scopes = new Set<Scope>();
    private localScope!: Scope;
    private isDestroyed = false;

    constructor(
        private subtree: T,
        public strictMode: boolean,
    ) {
        this.localScope = {
            name: 'local',
            symbols: new Map(),
            parent: null,
            descendants: new Set(),
            initializer: null,
        };
        this.linkSubtree(subtree, this.localScope);
    }

    public getOriginalRoot() {
        if (!this.isDestroyed) {
            throw new Error(`Builder must be destroyed before original root can be accessed`);
        }
        return this.subtree;
    }

    public edit(recipe: (node: T) => void) {
        this.assertNotDestroyed();

        const lastInstance = AstBuilder.editInstance;

        const proxyToOriginal = new WeakMap<object, object>();
        const originalToProxy = new WeakMap<object, object>();
        // const proxyMap = new WeakMap<object, object>();
        const nodeScopes = new WeakMap<object, Scope>();
        AstBuilder.editInstance = { proxyToOriginal, originalToProxy, nodeScopes };

        function proxify(original: any) {
            if (originalToProxy.has(original)) {
                // memoized
                return originalToProxy.get(original);
            }

            const proxy = new Proxy(original, handler);
            proxyToOriginal.set(proxy, original);
            originalToProxy.set(original, proxy);
            return proxy;
        }


        const directStartingScope = Array.from(this.scopes)
            .find(scope => scope.initializer === this.subtree);
        nodeScopes.set(this.subtree, directStartingScope || this.localScope);

        const handler: ProxyHandler<any> = {
            get: (target, prop) => {
                if (prop === '__proxy__') {
                    return true;
                }
                const property = target[prop];
                const targetScope = nodeScopes.get(target)!;
                // console.log(`get obj "${prop.toString()}" (scope: ${targetScope.name})`);

                if (Array.isArray(target)) {
                    const allowedArrayMethods = ['push', 'splice', 'shift', 'unshift'];

                    const lastTarget = target.slice();
                    if (allowedArrayMethods.includes(prop as string)) {
                        // create wrapper function for array method
                        return (...args: any[]) => {
                            const result = target[prop as any](...args);
                            // target has now changed
                            const removedElements = arrayDifference(lastTarget, target);
                            const addedElements = arrayDifference(target, lastTarget);

                            this.recursiveDereference(removedElements);
                            this.linkSubtree(addedElements, targetScope);

                            return result;
                        };
                    }

                    const isElementProp = isIntegerString(prop);
                    const allowedGetters = ['length', Symbol.iterator, 'type'];
                    const isAllowedProp = allowedGetters.includes(prop);
                    if (!isElementProp && !isAllowedProp) {
                        throw new Error(`Prop "${prop.toString()}" is not allowed here.`);
                    }
                }

                if (typeof property !== 'object' || property == null) {
                    return property;
                }

                const descendantScope = Array.from(targetScope.descendants)
                    .find(scope => scope.initializer === property);
                nodeScopes.set(property, descendantScope || targetScope);
                return proxify(property);
            },
            set: (target, prop, value) => {
                if (value.__proxy__) {
                    throw new Error(`Cannot set a proxy obj. Clone using provided function first`);
                }

                const targetScope = nodeScopes.get(target);
                if (!targetScope) {
                    throw new Error(`No scope found for property "${prop.toString()}"`);
                }

                const oldProperty = target[prop];
                if (oldProperty) {
                    this.recursiveDereference(oldProperty);
                }

                target[prop] = value;
                this.linkSubtree(value, targetScope);

                // console.log(`set ${prop.toString()} to ${value} on following object  (scope: ${targetScope.name})`, target);
                return true;
            }
        };

        recipe(proxify(this.subtree));

        AstBuilder.editInstance = lastInstance;
    }

    public static clone<T extends object>(obj: T): T {
        const instance = AstBuilder.getEditInstance();
        if ((obj as any).__proxy__) {
            const initial = instance.proxyToOriginal.get(obj);
            if (!initial) {
                throw new Error(`Could not clone proxy, original not found`);
            }
            obj = initial as T;
        }
        return structuredClone(obj);
    }

    public static rename(symbolNode: SymbolNode, newIdentifier: string): void {
        const instance = AstBuilder.getEditInstance();
        const noProxy = instance.proxyToOriginal.get(symbolNode);
        let childScope = noProxy && instance.nodeScopes.get(noProxy);
        if (!childScope) {
            throw new Error(`Cannot rename passed node. Node must be selected from root node.`);
        }
        const { identifier } = AstBuilder.getSymbolNodeIdentifier(symbolNode);
        const { symbol, scope } = AstBuilder.getIdentifierSymbolAndScope(identifier, childScope);

        scope.symbols.delete(identifier);
        if (scope.symbols.has(newIdentifier)) {
            throw new Error(`Cannot rename, "${newIdentifier}" already declared.`);
        }
        scope.symbols.set(newIdentifier, symbol);

        // rename references
        for (const reference of symbol.references) {
            const identifier = AstBuilder.getSymbolNodeIdentifier(reference);
            identifier.identifier = newIdentifier;
        }
    }

    public static merge(symbolNode: SymbolNode, targetSymbolNode: SymbolNode) {
        
        // get old scope and remove
        const instance = AstBuilder.getEditInstance();
        let childScope = instance.nodeScopes
            .get(instance.proxyToOriginal.get(symbolNode) || {});
        if (!childScope) {
            throw new Error(`The passed symbol must be a draft from AstBuilder.edit()`);
        }
        const { identifier } = AstBuilder.getSymbolNodeIdentifier(symbolNode);
        const { symbol, scope } = AstBuilder.getIdentifierSymbolAndScope(identifier, childScope);
        scope.symbols.delete(identifier);
        
        // find target symbol and scope
        let targetChildScope = instance.nodeScopes
            .get(instance.proxyToOriginal.get(targetSymbolNode) || {});
        if (!targetChildScope) {
            throw new Error(`The passed symbol must be a draft from AstBuilder.edit()`);
        }
        const { identifier: targetIdentifier } = AstBuilder.getSymbolNodeIdentifier(targetSymbolNode);
        const { symbol: targetSymbol } = 
            AstBuilder.getIdentifierSymbolAndScope(targetIdentifier, targetChildScope);
        // TODO: check if target is ascendant or same scope

        // rename and merge
        for (const ref of symbol.references) {
            const identifier = AstBuilder.getSymbolNodeIdentifier(ref);
            identifier.identifier = targetIdentifier;
            targetSymbol.references.add(ref);
        }
    }

    private static getIdentifierSymbolAndScope(identifier: string, scope: Scope) {
        let symbol: Symbol | undefined;
        while (scope) {
            if (scope.symbols.has(identifier)) {
                symbol = scope.symbols.get(identifier);
                break;
            }
            scope = scope.parent!;
        }
        if (!symbol || !scope) {
            throw new Error(`Symbol for "${identifier}" not found`);
        }
        return { symbol, scope };
    }

    private static getEditInstance() {
        if (!AstBuilder.editInstance) {
            throw new Error(`Not editing`);
        }
        return AstBuilder.editInstance;
    }

    public destroy() {
        this.scopes.clear();
        (this.localScope as any) = {}; // force dereference
        this.isDestroyed = true;
    }

    private assertNotDestroyed() {
        if (this.isDestroyed) {
            throw new Error(`Builder was destroyed`);
        }
    }

    private recursiveDereference(obj: any) {

        const visitSymbol = {
            enter: (path: Path<SymbolNode>) => {
                if (AstBuilder.isSymbolNode(path.node)) {
                    this.removeNodeReference(path.node);
                }
            }
        } as NodeVisitor<AstNodeShaderfrog>;

        visit(obj as AstNodeShaderfrog, {
            identifier: visitSymbol,
            declaration: visitSymbol,
            parameter_declaration: visitSymbol,
            function_call: visitSymbol,
            function_prototype: visitSymbol,
        });

        const visitScopes = {
            exit: (path: Path<ScopeNode>) => {
                for (const scope of this.scopes) {
                    if (scope.initializer === path.node) {
                        this.removeScope(scope);
                    }
                }
            }
        } as NodeVisitor<AstNodeShaderfrog>;

        visit(obj as AstNodeShaderfrog, {
            compound_statement: visitScopes,
            // @ts-ignore
            lambda_expression: visitScopes,
            function: visitScopes,
        })
    }

    private removeScope(scope: Scope) {
        for (const child of scope.descendants) {
            this.removeScope(child);
        }
        this.scopes.delete(scope);
        scope.parent?.descendants.delete(scope);
    }

    private removeNodeReference(node: SymbolNode) {
        const { identifier } = AstBuilder.getSymbolNodeIdentifier(node);
        for (const scope of this.scopes) {
            const symbol = scope.symbols.get(identifier);
            if (!symbol ||
                !symbol.references.has(node)
            ) {
                continue;
            }
            // symbol exists
            if (symbol.initializer === node) {
                symbol.initializer = null;
            }
            symbol.references.delete(node);
            if (symbol.references.size === 0) {
                scope.symbols.delete(identifier);
            }
            return true;
        }
        return false;
    }

    private linkSubtree(treeElement: object, currentScope: Scope) {

        const nestedCompounds = new Set<CompoundStatementNode>();
        const visitScopes: NodeVisitor<ScopeNode> = {
            enter: path => {
                const node = path.node;
                let name: string | undefined;
                if (node.type === 'compound_statement') {
                    if (nestedCompounds.has(node)) {
                        return;
                    }
                    name = 'COMPOUND';
                    nestedCompounds.add(node);
                } else if (node.type === 'lambda_expression') {
                    name = 'LAMBDA';
                    if (node.body.type === 'compound_statement') {
                        nestedCompounds.add(node.body);
                    }
                } else if (node.type === 'function') {
                    name = node.prototype.header.name.identifier;
                    nestedCompounds.add(node.body);
                } else {
                    debugger;
                    // what
                }
                if (!name) {
                    throw new Error(`No name`);
                }
                currentScope = this.pushNewScope(currentScope, name, node);
                // console.log('Pushed scope ' + name);
            },
            exit: path => {
                if (currentScope.initializer === path.node) {
                    // console.log('Popped scope ' + currentScope.name);
                    if (!currentScope.parent) {
                        throw new Error(`Cannot pop scope`);
                    }
                    currentScope = currentScope.parent;
                }
            }
        }

        const visitIdentifiers: NodeVisitor<IdentifierNode> = {
            enter: path => {
                let isDeclaration = false;
                let symbolNode: SymbolNode = path.node;
                let targetScope = currentScope;

                const parentType = path.parent?.type;
                if (parentType === 'declaration' &&
                    path.parent.identifier === path.node
                ) {
                    symbolNode = path.parent;
                    isDeclaration = true;
                } else if (parentType === 'parameter_declarator') {
                    symbolNode = path.parentPath!.parent as ParameterDeclarationNode;
                    isDeclaration = true;
                } else if (parentType === 'type_specifier'
                    && path.parentPath?.parent?.type === 'function_call'
                ) {
                    symbolNode = path.parentPath.parent as FunctionCallNode;
                } else if (parentType === 'function_header') {
                    symbolNode = path.parentPath!.parentPath!.parent as FunctionNode;
                    isDeclaration = true;
                    targetScope = currentScope.parent!; // necessary since order of nodes
                } else if (parentType === 'field_selection') {
                    return; // ignore
                } else {
                    // identifier reference
                }

                if (!AstBuilder.isSymbolNode(symbolNode)) {
                    throw new Error(`Not a valid symbol node`);
                }

                const identifier = path.node.identifier;
                if (glslBuiltIns.has(identifier) || marbleBuiltIns.has(identifier)) {
                    return;
                }
                for (const prefix of marblePrefixes) {
                    if (identifier.startsWith(prefix)) {
                        return;
                    }
                }
                // is symbol node
                if (isDeclaration) {
                    this.declareSymbol(targetScope, symbolNode, identifier);
                    // console.log('declared ' + identifier);
                } else {
                    this.addReference(targetScope, symbolNode, identifier);
                    // console.log('referenced ' + identifier);
                }
            }
        }

        const startingScope = currentScope;
        // @ts-ignore
        visit(treeElement, {
            // references
            identifier: visitIdentifiers,
            // scopes
            compound_statement: visitScopes,
            // @ts-ignore
            lambda_expression: visitScopes,
            function: visitScopes,
        });
        if (startingScope !== currentScope) {
            throw new Error(`Scope not back to starting depth`);
        }
    }

    private pushNewScope(currentScope: Scope, name: string, initializer: ScopeNode) {
        const scope: Scope = {
            name,
            parent: currentScope,
            symbols: new Map(),
            initializer,
            descendants: new Set(),
        }
        scope.parent!.descendants.add(scope);
        this.scopes.add(scope);
        return scope;
    }

    private findScopedSymbolByName(scope: Scope, identifier: string): Symbol | undefined {
        if (scope.symbols.has(identifier)) {
            return scope.symbols.get(identifier);
        }
        if (scope.parent) {
            return this.findScopedSymbolByName(scope.parent, identifier);
        }
    }

    private addReference(scope: Scope, reference: SymbolNode, identifier?: string) {
        identifier ||= AstBuilder.getSymbolNodeIdentifier(reference).identifier;
        const symbol = this.findScopedSymbolByName(scope, identifier!);

        if (symbol) {
            symbol.references.add(reference);
        } else if (this.strictMode) {
            throw new Error(`Symbol for "${identifier}" was not found in scope "${scope.name}" or its descendants`)
        }
    }

    private declareSymbol(scope: Scope, initializer: SymbolNode, identifier?: string) {
        identifier ||= AstBuilder.getSymbolNodeIdentifier(initializer).identifier;
        if (scope.symbols.has(identifier!)) {
            throw new Error(`Symbol "${identifier}" already defined in table`);
        }
        scope.symbols.set(identifier!, {
            initializer,
            references: new Set([initializer]),
        });
    }

    public static getSymbolNodeIdentifier(node: SymbolNode): IdentifierNode {
        switch (node.type) {
            case 'identifier':
                return node;
            case 'declaration':
                return node.identifier;
            case 'parameter_declaration':
                if (node.declaration.type !== 'parameter_declarator') {
                    break;
                }
                return node.declaration.identifier;
            case 'function_call':
                const typeSpec = node.identifier as SimpleTypeSpecifierNode;
                if (typeSpec.specifier?.type === 'identifier') {
                    return typeSpec.specifier;
                }
                throw new Error(`Keyword function is not symbol node`);
            case 'function':
                return node.prototype.header.name;
        }
        throw new Error(`No identifier found in node of type "${node.type}"`);
    }

    private static isSymbolNode(node: AstNode): node is SymbolNode {
        switch (node.type) {
            case 'identifier':
            case 'declaration':
                return true;
            case 'parameter_declaration':
                return node.declaration.type == 'parameter_declarator';
            case 'function_call':
                const typeSpec = node.identifier as SimpleTypeSpecifierNode;
                return typeSpec.specifier.type === 'identifier';
            case 'function':
                return true;
        }
        return false;
    }

    public static getFunctionCallIdentifier(call: FunctionCallNode) {
        const callIdentifier = call.identifier as any;
        const identifier: string | undefined =
            callIdentifier.specifier?.identifier ||
            callIdentifier.identifier;
        return identifier;
    }
}
