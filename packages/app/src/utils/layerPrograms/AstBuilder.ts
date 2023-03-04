import { AstNode, CompoundStatementNode, DeclarationNode, FunctionCallNode, FunctionNode, FunctionPrototypeNode, IdentifierNode, LambdaExpressionNode, ParameterDeclarationNode, SimpleTypeSpecifierNode } from "@marble/language";
import { NodeVisitor, Path, visit } from "@shaderfrog/glsl-parser/ast";
import { isIntegerString } from "../math";
import { AstNode as AstNodeShaderfrog } from "@shaderfrog/glsl-parser/ast";
import { arrayDifference } from "../arrays";

const glslBuiltIns = new Set([
    'abs', 'acos', 'acosh', 'all', 'any', 'asin', 'asinh', 'atan', 'atanh', 'atomicAdd', 'atomicAnd', 'atomicCompSwap', 'atomicCounter', 'atomicCounterDecrement', 'atomicCounterIncrement', 'atomicExchange', 'atomicMax', 'atomicMin', 'atomicOr', 'atomicXor', 'barrier', 'bitCount', 'bitfieldExtract', 'bitfieldInsert', 'bitfieldReverse', 'ceil', 'clamp', 'cos', 'cosh', 'cross', 'degrees', 'determinant', 'dFdx', 'dFdxCoarse', 'dFdxFine', 'dFdy', 'dFdyCoarse', 'dFdyFine', 'distance', 'dot', 'EmitStreamVertex', 'EmitVertex', 'EndPrimitive', 'EndStreamPrimitive', 'equal', 'exp', 'exp2', 'faceforward', 'findLSB', 'findMSB', 'floatBitsToInt', 'floatBitsToUint', 'floor', 'fma', 'fract', 'frexp', 'fwidth', 'fwidthCoarse', 'fwidthFine', 'greaterThan', 'greaterThanEqual', 'groupMemoryBarrier', 'imageAtomicAdd', 'imageAtomicAnd', 'imageAtomicCompSwap', 'imageAtomicExchange', 'imageAtomicMax', 'imageAtomicMin', 'imageAtomicOr', 'imageAtomicXor', 'imageLoad', 'imageSamples', 'imageSize', 'imageStore', 'imulExtended', 'intBitsToFloat', 'interpolateAtCentroid', 'interpolateAtOffset', 'interpolateAtSample', 'inverse', 'inversesqrt', 'isinf', 'isnan', 'ldexp', 'length', 'lessThan', 'lessThanEqual', 'log', 'log2', 'matrixCompMult', 'max', 'memoryBarrier', 'memoryBarrierAtomicCounter', 'memoryBarrierBuffer', 'memoryBarrierImage', 'memoryBarrierShared', 'min', 'mix', 'mod', 'modf', 'noise', 'noise1', 'noise2', 'noise3', 'noise4', 'normalize', 'not', 'notEqual', 'outerProduct', 'packDouble2x32', 'packHalf2x16', 'packSnorm2x16', 'packSnorm4x8', 'packUnorm', 'packUnorm2x16', 'packUnorm4x8', 'pow', 'radians', 'reflect', 'refract', 'round', 'roundEven', 'sign', 'sin', 'sinh', 'smoothstep', 'sqrt', 'step', 'tan', 'tanh', 'texelFetch', 'texelFetchOffset', 'texture', 'textureGather', 'textureGatherOffset', 'textureGatherOffsets', 'textureGrad', 'textureGradOffset', 'textureLod', 'textureLodOffset', 'textureOffset', 'textureProj', 'textureProjGrad', 'textureProjGradOffset', 'textureProjLod', 'textureProjLodOffset', 'textureProjOffset', 'textureQueryLevels', 'textureQueryLod', 'textureSamples', 'textureSize', 'transpose', 'trunc', 'uaddCarry', 'uintBitsToFloat', 'umulExtended', 'unpackDouble2x32', 'unpackHalf2x16', 'unpackSnorm2x16', 'unpackSnorm4x8', 'unpackUnorm', 'unpackUnorm2x16', 'unpackUnorm4x8', 'usubBorrow', // GLSL ES 1.00 'texture2D', 'textureCube'
]);
const marbleBuildIns = new Set([
    'Distance', 'tx'
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

export class AstBuilder<T extends AstNode> {

    private scopes = new Set<Scope>();
    private localScope!: Scope;
    private isDestroyed = false;
    private readonlyObjToProxy = new WeakMap();
    private readonlyProxyToObj = new WeakMap();

    constructor(
        private subtree: T
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

    public get node() {
        this.assertNotDestroyed();    

        const readonlyHandler: ProxyHandler<any> = {
            get: (target, prop) => {
                const property = target[prop];

                if (typeof property !== 'object' || property == null) {
                    return property;
                }

                const memoizedProxy = this.readonlyObjToProxy.get(property);
                if (memoizedProxy) {
                    return memoizedProxy;
                }

                const newProxy = new Proxy(property, readonlyHandler);
                this.readonlyObjToProxy.set(property, newProxy);
                this.readonlyProxyToObj.set(newProxy, property);
                return newProxy;
            }
        }
        return new Proxy(this.subtree, readonlyHandler);
    }

    public compare(obj1: any, obj2: any) {
        if (obj1 === obj2) return true;
        const target1 = this.readonlyProxyToObj.get(obj1);
        const target2 = this.readonlyProxyToObj.get(obj2);
        if (target1 != null && target1 === target2) return true;
        return false;
    }

    public edit(recipe: (
        node: T,
        clone: <K extends object>(proxy: K) => K,
        rename: (symbolNode: SymbolNode, newIdentifier: string) => void,
    ) => void) {
        this.assertNotDestroyed();

        const proxyMap = new WeakMap<object, object>();

        function makeProxy(obj: any) {
            const proxy = new Proxy(obj, handler)
            proxyMap.set(proxy, obj);
            return proxy;
        }

        const nodeScopes = new WeakMap<object, Scope>();

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
                    const allowedArrayMethods = [ 'push', 'splice', 'shift', 'unshift' ];

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
                    const allowedGetters = [ 'length', Symbol.iterator ];
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
                return makeProxy(property);
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

        const proxy = makeProxy(this.subtree);
        const clone = (obj: any) => {
            if (obj.__proxy__) {
                const initial = proxyMap.get(obj);
                if (!initial) {
                    throw new Error(`Could not clone proxy, original not found`);
                }
                obj = initial;
            }
            return structuredClone(obj);
        }

        const rename = (symbolNode: SymbolNode, newIdentifier: string) => {
            const noProxy = proxyMap.get(symbolNode);
            let scope = noProxy && nodeScopes.get(noProxy);
            if (!scope) {
                throw new Error(`Cannot rename passed node. Node must be selected from root node.`);
            }

            const { identifier } = AstBuilder.getSymbolNodeIdentifier(symbolNode);
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

            // rename references
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

        recipe(proxy, clone, rename);
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
                this.removeNodeReference(path.node);
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
                if (parentType === 'declaration') {
                    symbolNode = path.parent;
                    isDeclaration = true;
                } else if (parentType === 'parameter_declarator') {
                    symbolNode = path.parentPath!.parent as ParameterDeclarationNode;
                    isDeclaration = true;
                } else if (parentType === 'type_specifier'
                    && path.parentPath?.parent?.type === 'function_call') {
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

                const identifier = path.node.identifier;
                if (glslBuiltIns.has(identifier) || marbleBuildIns.has(identifier)) {
                    return;
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
        if (!symbol) {
            throw new Error(`Symbol for "${identifier}" was not found in scope "${scope.name}" or its descendants`);
        }
        symbol.references.add(reference);
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
                if (typeSpec.specifier.type !== 'identifier') {
                    throw new Error(`Keyword node cannot be referenced`);
                }
                return typeSpec.specifier;
            case 'function':
                return node.prototype.header.name;
        }
        throw new Error(`No identifier found in node of type "${node.type}"`);
    }

    // private static isSymbolNode(node: AstNode): node is SymbolNode {
    //     switch (node.type) {
    //         case 'identifier':
    //         case 'declaration':
    //             return true;
    //         case 'parameter_declaration':
    //             return node.declaration.type == 'parameter_declarator';
    //         case 'function_call':
    //             const typeSpec = node.identifier as SimpleTypeSpecifierNode;
    //             return typeSpec.specifier.type === 'identifier';
    //         case 'function_prototype':
    //             return true;
    //     }
    //     return false;
    // }

    public static getFunctionCallIdentifier(call: FunctionCallNode) {
        const callIdentifier = call.identifier as any;
        const identifier: string | undefined =
            callIdentifier.specifier?.identifier ||
            callIdentifier.identifier;
        return identifier;
    }
}
