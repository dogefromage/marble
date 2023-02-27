import { AstNode, CompoundStatementNode, DeclarationNode, FunctionCallNode, FunctionNode, FunctionPrototypeNode, IdentifierNode, LambdaExpressionNode, ParameterDeclarationNode, SimpleTypeSpecifierNode, StatementNode } from "@marble/language";
import { NodeVisitor, visit } from "@shaderfrog/glsl-parser/ast";
import objectPath from "object-path";

const glslBuiltIns = new Set([
    'abs', 'acos', 'acosh', 'all', 'any', 'asin', 'asinh', 'atan', 'atanh', 'atomicAdd', 'atomicAnd', 'atomicCompSwap', 'atomicCounter', 'atomicCounterDecrement', 'atomicCounterIncrement', 'atomicExchange', 'atomicMax', 'atomicMin', 'atomicOr', 'atomicXor', 'barrier', 'bitCount', 'bitfieldExtract', 'bitfieldInsert', 'bitfieldReverse', 'ceil', 'clamp', 'cos', 'cosh', 'cross', 'degrees', 'determinant', 'dFdx', 'dFdxCoarse', 'dFdxFine', 'dFdy', 'dFdyCoarse', 'dFdyFine', 'distance', 'dot', 'EmitStreamVertex', 'EmitVertex', 'EndPrimitive', 'EndStreamPrimitive', 'equal', 'exp', 'exp2', 'faceforward', 'findLSB', 'findMSB', 'floatBitsToInt', 'floatBitsToUint', 'floor', 'fma', 'fract', 'frexp', 'fwidth', 'fwidthCoarse', 'fwidthFine', 'greaterThan', 'greaterThanEqual', 'groupMemoryBarrier', 'imageAtomicAdd', 'imageAtomicAnd', 'imageAtomicCompSwap', 'imageAtomicExchange', 'imageAtomicMax', 'imageAtomicMin', 'imageAtomicOr', 'imageAtomicXor', 'imageLoad', 'imageSamples', 'imageSize', 'imageStore', 'imulExtended', 'intBitsToFloat', 'interpolateAtCentroid', 'interpolateAtOffset', 'interpolateAtSample', 'inverse', 'inversesqrt', 'isinf', 'isnan', 'ldexp', 'length', 'lessThan', 'lessThanEqual', 'log', 'log2', 'matrixCompMult', 'max', 'memoryBarrier', 'memoryBarrierAtomicCounter', 'memoryBarrierBuffer', 'memoryBarrierImage', 'memoryBarrierShared', 'min', 'mix', 'mod', 'modf', 'noise', 'noise1', 'noise2', 'noise3', 'noise4', 'normalize', 'not', 'notEqual', 'outerProduct', 'packDouble2x32', 'packHalf2x16', 'packSnorm2x16', 'packSnorm4x8', 'packUnorm', 'packUnorm2x16', 'packUnorm4x8', 'pow', 'radians', 'reflect', 'refract', 'round', 'roundEven', 'sign', 'sin', 'sinh', 'smoothstep', 'sqrt', 'step', 'tan', 'tanh', 'texelFetch', 'texelFetchOffset', 'texture', 'textureGather', 'textureGatherOffset', 'textureGatherOffsets', 'textureGrad', 'textureGradOffset', 'textureLod', 'textureLodOffset', 'textureOffset', 'textureProj', 'textureProjGrad', 'textureProjGradOffset', 'textureProjLod', 'textureProjLodOffset', 'textureProjOffset', 'textureQueryLevels', 'textureQueryLod', 'textureSamples', 'textureSize', 'transpose', 'trunc', 'uaddCarry', 'uintBitsToFloat', 'umulExtended', 'unpackDouble2x32', 'unpackHalf2x16', 'unpackSnorm2x16', 'unpackSnorm4x8', 'unpackUnorm', 'unpackUnorm2x16', 'unpackUnorm4x8', 'usubBorrow', // GLSL ES 1.00 'texture2D', 'textureCube'
]);
const marbleBuildIns = new Set([
    'Distance',
]);

// type SymbolType = 'function' | 'var';
type SymbolNode = IdentifierNode | DeclarationNode | ParameterDeclarationNode | FunctionCallNode | FunctionPrototypeNode;
type ScopeNode = FunctionNode | CompoundStatementNode | LambdaExpressionNode /* add more */;

interface Symbol {
    // type: SymbolType;
    initializer: SymbolNode;
    references: Set<SymbolNode>;
}

interface Scope {
    name: string;
    symbols: Map<string, Symbol>;
    parent: Scope | null;
    initializer: ScopeNode | null;
}

export class AstSubtree {

    private scopes = new Set<Scope>();
    private localScope: Scope;

    constructor(
        private subtree: AstNode
    ) {
        this.localScope = {
            name: 'local',
            symbols: new Map(),
            parent: null,
            initializer: null,
        };
        this.scopes.add(this.localScope);
        this.linkSubtree(subtree, this.localScope);
    }

    public addStatements(path: string[], statement: StatementNode) {
        if (!objectPath.has(this.subtree, path)) {
            throw new Error(`Provided path is not on subtree`);
        }

        let currObj: any = this.subtree;
        let currScope = this.localScope;

        const pathCp = path.slice();
        while (pathCp.length) {
            let key = pathCp.shift()!;
            currObj = currObj[key];
            
            for (const scope of this.scopes) {
                if (scope.initializer === currObj) {
                    currScope = scope.initializer;
                }
            }
        }
    }

    private linkSubtree(treeRoot: AstNode, currentScope: Scope) {
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
                    symbolNode = path.parentPath!.parent as FunctionPrototypeNode;
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
        visit(treeRoot, {
            // references
            identifier: visitIdentifiers,
            // scopes
            compound_statement: visitScopes,
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
        }
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
        identifier ||= this.getSymbolNodeIdentifier(reference).identifier;
        const symbol = this.findScopedSymbolByName(scope, identifier);
        if (!symbol) {
            throw new Error(`Symbol for "${identifier}" was not found in scope "${scope.name}" or its descendants`);
        }
        symbol.references.add(reference);
    }

    private declareSymbol(scope: Scope, initializer: SymbolNode, identifier?: string) {
        identifier ||= this.getSymbolNodeIdentifier(initializer).identifier;
        if (scope.symbols.has(identifier)) {
            throw new Error(`Symbol "${identifier}" already defined in table`);
        }
        scope.symbols.set(identifier, {
            initializer,
            references: new Set([initializer]),
        });
    }

    public getSymbolNodeIdentifier(node: SymbolNode): IdentifierNode {
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
            case 'function_prototype':
                return node.header.name;
        }
        throw new Error(`No identifier found in node of type "${node.type}"`);
    }

    private isSymbolNode(node: AstNode): node is SymbolNode {
        switch (node.type) {
            case 'identifier':
            case 'declaration':
                return true;
            case 'parameter_declaration':
                return node.declaration.type == 'parameter_declarator';
            case 'function_call':
                const typeSpec = node.identifier as SimpleTypeSpecifierNode;
                return typeSpec.specifier.type === 'identifier';
            case 'function_prototype':
                return true;
        }
        return false;
    }

    private getFunctionCallIdentifier(call: FunctionCallNode) {
        const callIdentifier = call.identifier as any;
        const identifier: string | undefined =
            callIdentifier.specifier?.identifier ||
            callIdentifier.identifier ||
            callIdentifier.keyword;
        return identifier;
    }
}