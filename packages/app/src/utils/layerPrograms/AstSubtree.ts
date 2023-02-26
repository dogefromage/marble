import { AstNode, CompoundStatementNode, DeclarationNode, FunctionCallNode, FunctionNode, FunctionPrototypeNode, IdentifierNode, LambdaExpressionNode, ParameterDeclarationNode, SimpleTypeSpecifierNode } from "@marble/language";
import { NodeVisitor, visit } from "@shaderfrog/glsl-parser/ast";

// type SymbolType = 'function' | 'atomic';

type SymbolNode = IdentifierNode | DeclarationNode | ParameterDeclarationNode | FunctionCallNode | FunctionPrototypeNode;

type ScopeNode = FunctionNode | CompoundStatementNode | LambdaExpressionNode /* add more */;

const glslBuiltIns = new Set([
    'abs', 'acos', 'acosh', 'all', 'any', 'asin', 'asinh', 'atan', 'atanh', 'atomicAdd', 'atomicAnd', 'atomicCompSwap', 'atomicCounter', 'atomicCounterDecrement', 'atomicCounterIncrement', 'atomicExchange', 'atomicMax', 'atomicMin', 'atomicOr', 'atomicXor', 'barrier', 'bitCount', 'bitfieldExtract', 'bitfieldInsert', 'bitfieldReverse', 'ceil', 'clamp', 'cos', 'cosh', 'cross', 'degrees', 'determinant', 'dFdx', 'dFdxCoarse', 'dFdxFine', 'dFdy', 'dFdyCoarse', 'dFdyFine', 'distance', 'dot', 'EmitStreamVertex', 'EmitVertex', 'EndPrimitive', 'EndStreamPrimitive', 'equal', 'exp', 'exp2', 'faceforward', 'findLSB', 'findMSB', 'floatBitsToInt', 'floatBitsToUint', 'floor', 'fma', 'fract', 'frexp', 'fwidth', 'fwidthCoarse', 'fwidthFine', 'greaterThan', 'greaterThanEqual', 'groupMemoryBarrier', 'imageAtomicAdd', 'imageAtomicAnd', 'imageAtomicCompSwap', 'imageAtomicExchange', 'imageAtomicMax', 'imageAtomicMin', 'imageAtomicOr', 'imageAtomicXor', 'imageLoad', 'imageSamples', 'imageSize', 'imageStore', 'imulExtended', 'intBitsToFloat', 'interpolateAtCentroid', 'interpolateAtOffset', 'interpolateAtSample', 'inverse', 'inversesqrt', 'isinf', 'isnan', 'ldexp', 'length', 'lessThan', 'lessThanEqual', 'log', 'log2', 'matrixCompMult', 'max', 'memoryBarrier', 'memoryBarrierAtomicCounter', 'memoryBarrierBuffer', 'memoryBarrierImage', 'memoryBarrierShared', 'min', 'mix', 'mod', 'modf', 'noise', 'noise1', 'noise2', 'noise3', 'noise4', 'normalize', 'not', 'notEqual', 'outerProduct', 'packDouble2x32', 'packHalf2x16', 'packSnorm2x16', 'packSnorm4x8', 'packUnorm', 'packUnorm2x16', 'packUnorm4x8', 'pow', 'radians', 'reflect', 'refract', 'round', 'roundEven', 'sign', 'sin', 'sinh', 'smoothstep', 'sqrt', 'step', 'tan', 'tanh', 'texelFetch', 'texelFetchOffset', 'texture', 'textureGather', 'textureGatherOffset', 'textureGatherOffsets', 'textureGrad', 'textureGradOffset', 'textureLod', 'textureLodOffset', 'textureOffset', 'textureProj', 'textureProjGrad', 'textureProjGradOffset', 'textureProjLod', 'textureProjLodOffset', 'textureProjOffset', 'textureQueryLevels', 'textureQueryLod', 'textureSamples', 'textureSize', 'transpose', 'trunc', 'uaddCarry', 'uintBitsToFloat', 'umulExtended', 'unpackDouble2x32', 'unpackHalf2x16', 'unpackSnorm2x16', 'unpackSnorm4x8', 'unpackUnorm', 'unpackUnorm2x16', 'unpackUnorm4x8', 'usubBorrow', // GLSL ES 1.00 'texture2D', 'textureCube'
]);
const marbleBuildIns = new Set([
    'Distance',
]);

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
    private activeScope: Scope;

    constructor(
        private subtree: AstNode
    ) {
        this.activeScope = {
            name: 'local',
            symbols: new Map(),
            parent: null,
            initializer: null,
        }
        this.scopes.add(this.activeScope);
        this.scopify(subtree);
    }

    private scopify(astNode: AstNode) {
        // const visitReferences: NodeVisitor<SymbolNode> = {
        //     enter: path => {
        //         const node = path.node as AstNode;
        //         if (!this.isSymbolNode(node)) {
        //             return;
        //         }
        //         const { identifier } = this.getSymbolNodeIdentifier(node);
        //         if (glslBuiltIns.has(identifier) || marbleBuildIns.has(identifier)) {
        //             return;
        //         }
        //         // is symbol node
        //         const declarations: SymbolNode['type'][] = ['declaration', 'parameter_declaration', 'function_prototype'];
        //         const isDeclaration = declarations.includes(node.type);
        //         if (isDeclaration) {
        //             this.declareSymbol(this.activeScope, node, identifier);
        //             console.log('declared ' + identifier);
        //         } else {
        //             this.addReference(this.activeScope, node, identifier);
        //             console.log('referenced ' + identifier);
        //         }

        //     }
        // }

        const visitScopeStack: AstNode[] = [];

        const visitScopes: NodeVisitor<CompoundStatementNode | LambdaExpressionNode> = {
            enter: path => {
                const node = path.node;
                let name: string | undefined;
                let initializer: ScopeNode | undefined;
                if (node.type === 'compound_statement') {
                    const parentType = path.parent?.type;
                    if (parentType == null) {
                        name = 'Anonymous Compound';
                        initializer = node;
                    } else if (parentType === 'function') {
                        name = path.parent.prototype.header.name.identifier;
                        initializer = path.parent as FunctionNode;
                    } else if ((parentType as any) === 'lambda_expression') {
                        return; // handle case when hitting lambda_expression itself
                    } else {
                        debugger;
                        // what
                    }
                } else if (node.type === 'lambda_expression') {
                    name = 'Anonymous lambda';
                    initializer = node;
                } else {
                    debugger;
                    // what
                }

                if (name && initializer) {
                    this.pushNewScope(name, node);
                    visitScopeStack.push(node);
                } 
            },
            exit: path => {
                const stackHead = visitScopeStack.at(-1);
                if (stackHead === path.node) {
                    visitScopeStack.pop();
                    if (!this.activeScope.parent) {
                        throw new Error(`Cannot pop scope`);
                    }
                    console.log('Popped scope ' + this.activeScope.name);
                    this.activeScope = this.activeScope.parent;
                }
            }
        }

        const visitIdentifiers: NodeVisitor<IdentifierNode> = {
            enter: path => {
                const node = path.node;
                let isDeclaration: boolean;
                let symbolNode: SymbolNode;

                const parentType = path.parent?.type;
                if (parentType === null) {
                    // identifier reference
                    symbolNode = node;
                    isDeclaration = false;
                } else if (parentType === 'declaration') {
                    symbolNode = path.parent;
                    isDeclaration = true;
                } else if (parentType === 'parameter_declarator') {
                    symbolNode = path.parentPath!.parent as ParameterDeclarationNode;
                    isDeclaration = true;
                } else if (parentType === 'type_specifier'
                    && path.parentPath?.parent?.type === 'function_call') {
                    symbolNode = path.parentPath.parent as FunctionCallNode;
                    isDeclaration = false;
                } else if (parentType === 'function_header') {
                    symbolNode = path.parentPath!.parent as FunctionPrototypeNode;
                    isDeclaration = true;
                } else {
                    // console.log('unknown identifier', node);
                    return;
                }

                const identifier = node.identifier;
                if (glslBuiltIns.has(identifier) || marbleBuildIns.has(identifier)) {
                    return;
                }
                // is symbol node
                if (isDeclaration) {
                    this.declareSymbol(this.activeScope, node, identifier);
                    console.log('declared ' + identifier);
                } else {
                    this.addReference(this.activeScope, node, identifier);
                    console.log('referenced ' + identifier);
                }
            }
        }

        const startingScope = this.activeScope;

        // @ts-ignore
        visit(astNode, {
            // references
            // identifier: visitReferences,
            // declaration: visitReferences,
            // parameter_declaration: visitReferences,
            // function_call: visitReferences,
            // function_prototype: visitReferences,
            identifier: visitIdentifiers,
            // scopes
            compound_statement: visitScopes,
        });

        if (startingScope !== this.activeScope) {
            throw new Error(`Scope not back to starting depth`);
        }
    }

    private pushNewScope(name: string, initializer: ScopeNode) {
        
        console.log('Pushed scope ' + name);

        const scope: Scope = {
            name,
            parent: this.activeScope,
            symbols: new Map(),
            initializer,
        }
        this.scopes.add(scope);
        this.activeScope = scope;
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