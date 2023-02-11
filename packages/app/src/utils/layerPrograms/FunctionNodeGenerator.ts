import { AstNode, CompoundStatementNode, DeclarationNode, DeclarationStatementNode, ExpressionStatementNode, FullySpecifiedTypeNode, FunctionCallNode, FunctionNode, FunctionPrototypeNode, IdentifierNode, KeywordNode, LiteralNode, NodeVisitor, NodeVisitors, Path, ReturnStatementNode, TypeSpecifierNode, visit } from "@shaderfrog/glsl-parser/ast";
import _, { isArray } from "lodash";
import { BaseInputRowT, DataTypes, GeometryConnectionData, GeometryEdge, GeometryS, GeometrySignature, GNodeState, GNodeTemplate, ObjMap, RowS, RowTypes } from "../../types";
import { findRight } from "../arrays";
import { formatLiteral } from "./generateCodeStatements";

class AstNodeFactory {
    public literal(literal: string, whitespace = ' '): LiteralNode {
        return { type: 'literal', literal, whitespace }
    }
    public identifier(identifier: string, whitespace = ' '): IdentifierNode {
        return { type: 'identifier', identifier, whitespace }
    }
    public keyword(keyword: string, whitespace = ' '): KeywordNode {
        return { type: 'keyword', token: keyword, whitespace };
    }
    public declarationStatement(typeSpec: FullySpecifiedTypeNode, identifier: string, expression: any): DeclarationStatementNode {
        return {
            type: 'declaration_statement',
            declaration: {
                type: 'declaration_list',
                specified_type: typeSpec,
                declaration: [
                    {
                        type: 'declaration',
                        identifier,
                        quantifier: null,
                        operator: null,
                        initializer: expression,
                    }
                ],
                commas: [],
            },
            semi: this.literal(';', '\n'),
        }
    }
    public returnStatement(expression: any): ReturnStatementNode {
        return {
            type: 'return_statement',
            return: this.keyword('return'),
            expression,
            semi: this.literal(';', '\n'),
        };
    }
    public fullySpecifiedType(typeName: string): FullySpecifiedTypeNode {
        return {
            type: 'fully_specified_type',
            qualifiers: [],
            specifier: {
                type: 'type_specifier',
                quantifier: null,
                specifier: this.identifier(typeName),
            },
        }
    }
}
const factory = new AstNodeFactory();

function getIdentifierFromParameters(params: any[] /* TODO */): string[] {
    const identifiers = params
        .map((param: any /* TODO */) => param.declaration.identifier.identifier);
    if (!isArray(identifiers)) {
        throw new Error(`Params not array, maybe no params`);
    }
    return identifiers;
}

function getNodeOutputIdentifier(nodeId: string) {
    return `o_${nodeId}`;
}

function notImplemented() {
    throw new Error(`Not Implemented`);
}

// enum Prefixes {
//     Local = 'l',
//     Dynamic = 'd',
//     Edge = 'e',
// }

// interface StatementLocation {
//     functionIndex: number;
//     statementIndex: number;
// }

interface LambdaTypeSpecifierNode {
    type: 'lambda_type_specifier',
    return_type: TypeSpecifierNode
    colon: IdentifierNode;
    lp: IdentifierNode;
    args: TypeSpecifierNode[];
    rp: IdentifierNode;
}

interface LambdaExpressionNode {
    lambda: IdentifierNode;
    lp: IdentifierNode;
    parameters: FunctionPrototypeNode['parameters'];
    rp: IdentifierNode;
    colon: IdentifierNode;
    expression: CompoundStatementNode | any // TODO;
}

type ExtendedNodeVisitors = NodeVisitors & {
    lambda_expression?: NodeVisitor<LambdaExpressionNode>;
}

interface NodeInfo {
    index: number;
    state: GNodeState;
    template: GNodeTemplate;
}

export default class GeometryFunctionGenerator {

    // private textureCoordinateCounter;
    // private textureVarMappings: ProgramTextureVarMapping[] = [];

    // private definedVariables = new Map<OutputJointIdenfifier, VariableDefinition>();
    // private definedLambdas = new Map<OutputJointIdenfifier, LambdaDefinition>();
    private functionStatements: AstNode[] = [];
    private definitions = new Map<string, TranspilerObject>();

    constructor(
        private geometry: GeometryS,
        private connectionData: GeometryConnectionData,
        private signature: GeometrySignature,
        // props: { textureVarRowIndex: number }
    ) {
        // const counterOffset = props.textureVarRowIndex * LOOKUP_TEXTURE_WIDTH;
        // this.textureCoordinateCounter = new Counter(LOOKUP_TEXTURE_WIDTH, counterOffset);
    }

    public processNode(info: NodeInfo) {
        const { index, state, template } = info;

        const nodeTranspiler = new NodeTranspiler(
            this.geometry, this.connectionData,
            index, state, template,
            this.definitions,
        );
        nodeTranspiler.transpile();
        const statements = nodeTranspiler.getTranspiledStatements();
        this.functionStatements.push(...statements);

        // const outputRow = template.rows.find(row => row.type === 'output') as OutputRowT;
        // const outputIdentifier = this.getOutputJointIdentifier(state.id);

        // const visitors: ExtendedNodeVisitors = {
        //     declaration_statement: {
        //         enter: path => {
        //             throw new Error(`Implement`);
        //         },
        //     },
        //     return_statement: {
        //         enter: path => {
        //             throw new Error(`Implement`);
        //         },
        //     },
        //     expression_statement: {
        //         exit: path => {
        //             const varDef: VariableDefinition = {
        //                 type: 'variable_definition',
        //                 dataType: outputRow.dataType,
        //                 identifier: outputIdentifier,
        //             };
        //             if (this.definedVariables.has(outputIdentifier)) {
        //                 throw new Error(`Var already defined`);
        //             }
        //             this.definedVariables.set(outputIdentifier, varDef);
        //             const returnType = factory.fullySpecifiedType(outputRow.dataType);
        //             const declaration = factory.declaration(returnType, outputIdentifier, path.node.expression);
        //             Object.assign(path.node, declaration);
        //         },
        //     },
        //     lambda_expression: {
        //         enter: path => {
        //             const parentExpression = path.parent as ExpressionStatementNode;
        //             if (parentExpression.type !== "expression_statement") {
        //                 throw new Error(`Implement`);
        //             }
        //             const compoundStatement = path.parentPath?.parentPath?.node as AstNode;
        //             if (compoundStatement?.type !== 'compound_statement') {
        //                 throw new Error(`Parentparent is ${compoundStatement.type}`);
        //             }
        //             // remove statement
        //             compoundStatement.statements =
        //                 compoundStatement.statements.filter(s => s !== parentExpression);

        //             const variableMap = this.getVariableMap(info);
        //             const lambdaParamIdents = this.getIdentifierFromParameters(path.node.parameters);
        //             for (const param of lambdaParamIdents) {
        //                 variableMap[param] = { type: 'ignore' };
        //             }
        //             // instantiate lambdas expression body
        //             const instantiated = this.instantiateExpression(path.node.expression, variableMap);

        //             if (this.definedLambdas.has(outputIdentifier)) {
        //                 throw new Error(`Lambda already defined`);
        //             }
        //             this.definedLambdas.set(outputIdentifier, {
        //                 type: 'lambda_definition',
        //                 parameters: path.node.parameters,
        //                 bodyExpression: instantiated,
        //             });
        //         }
        //     }
        // };

        // // REPLACE WITH PRODUCE
        // const clonedCompoundNode = _.cloneDeep(template.instructions.body);
        // visit(clonedCompoundNode, visitors);
        // // const originalCompoundNode = nodeTemplate.instructions.body;
        // // const processedCompoundNode = produce(originalCompoundNode, draftNode => {
        // //     visit(draftNode, visitors);
        // // });
        // this.functionStatements.push(...clonedCompoundNode.statements)

        // const { type: templateType } = decomposeTemplateId(template.id);
        // const isOutputNode = templateType === 'output';
    }

    public processOutput(nodeId: string) {
        const varKey = getNodeOutputIdentifier(nodeId);
        const returnStatement = factory.returnStatement(factory.literal(varKey));
        this.functionStatements.push(returnStatement);
    }

    public generateFunctionNode(): FunctionNode {

        console.log(this.definitions);
        console.log(this.functionStatements);


        throw new Error(`TODO`);

        // const { name, inputs, outputs } = this.signature;
        // const compoundFunctionBody: CompoundStatementNode = {
        //     type: 'compound_statement',
        //     lb: factory.literal('{', '\n'),
        //     rb: factory.literal('}'),
        //     statements: this.statements,
        // };

        // const funcProto = this.generatePrototypeNode();
        // const functionNode: FunctionNode = {
        //     type: 'function',
        //     prototype: funcProto,
        //     body: compoundFunctionBody,
        // };
        // return functionNode;
    }

    // public getTextureVarMappings() {
    //     return this.textureVarMappings;
    // }

    // private getIdentifierName(prefix: string, ...data: (number | string)[]) {
    //     return [prefix, ...data].join('_');
    // }

    // private getStatementLocation(path: Path<AstNode>): StatementLocation {

    //     let currPath: Path<AstNode> = path;
    //     while (currPath.node.type !== 'declaration_statement') {
    //         if (!currPath.parentPath) {
    //             throw new Error("No declaration_statement found");
    //         }
    //         currPath = currPath.parentPath;
    //     }
    //     const statementIndex = currPath.index!;

    //     while (currPath.node.type !== 'function') {
    //         if (!currPath.parentPath) {
    //             throw new Error("No function found");
    //         }
    //         currPath = currPath.parentPath;
    //     }
    //     const functionIndex = currPath.index!;

    //     return { statementIndex, functionIndex };
    // }

    // private addDeclarationInfront(path: Path<AstNode>, code: string) {
    //     const location = this.getStatementLocation(path);
    //     this.additionalStatements.push({
    //         location,
    //         node: { type: 'literal', literal: code, whitespace: '\n    ' }
    //     });
    // }

    private visitDeclaration(path: Path<DeclarationNode>, nodeState: GNodeState, nodeTemplate: GNodeTemplate) {
        //     const { node, nodeData } = this.getNode();
        //     const token = path.node.identifier.identifier;
        //     const rowIndex = nodeData.template.rows.findIndex(row => row.id === token);
        //     const idntNode = path.node.identifier;

        //     if (rowIndex < 0) // no row, declare local 
        //     {
        //         const newId = this.getIdentifierName(Prefixes.Local, this.nodeIndex, token);
        //         if (this.definedLocals.has(newId)) {
        //             throw new Error(`Variable "${newId}" (originaly "${token}") has already been defined.`);
        //         }
        //         this.definedLocals.add(newId);
        //         idntNode.identifier = newId;
        //         return;
        //     }

        //     // generate name for edge
        //     idntNode.identifier = this.getIdentifierName(Prefixes.Edge, this.nodeIndex, rowIndex);
    }
}



interface LambdaObject {
    type: 'lambda';
    parameters: FunctionPrototypeNode['parameters'];
    bodyExpression: AstNode;
}
interface VariableObject {
    type: 'variable';
    typeSpecifier: FullySpecifiedTypeNode;
    identifier: string;
}
type TranspilerObject = LambdaObject | VariableObject;



interface EdgeRule {
    type: 'edge';
    identifier: string;
    reference: TranspilerObject;
}
interface ConstantRule {
    type: 'constant';
    identifier: string;
    literal: string;
}
interface IgnoreRule {
    type: 'ignore';
    identifier: string;
}
type MappingRule = EdgeRule | ConstantRule | IgnoreRule;
type VariableMappingScope = readonly MappingRule[];
type VariableMappingScopeStack = VariableMappingScope[];

const defaultScopeKeys = [
    [ // NATIVE GLSL taken from @shaderfrog/glsl-parser .pegjs
        // TODO remove unnecessary
        'abs', 'acos', 'acosh', 'all', 'any', 'asin', 'asinh', 'atan', 'atanh', 'atomicAdd', 'atomicAnd', 'atomicCompSwap', 'atomicCounter', 'atomicCounterDecrement', 'atomicCounterIncrement', 'atomicExchange', 'atomicMax', 'atomicMin', 'atomicOr', 'atomicXor', 'barrier', 'bitCount', 'bitfieldExtract', 'bitfieldInsert', 'bitfieldReverse', 'ceil', 'clamp', 'cos', 'cosh', 'cross', 'degrees', 'determinant', 'dFdx', 'dFdxCoarse', 'dFdxFine', 'dFdy', 'dFdyCoarse', 'dFdyFine', 'distance', 'dot', 'EmitStreamVertex', 'EmitVertex', 'EndPrimitive', 'EndStreamPrimitive', 'equal', 'exp', 'exp2', 'faceforward', 'findLSB', 'findMSB', 'floatBitsToInt', 'floatBitsToUint', 'floor', 'fma', 'fract', 'frexp', 'fwidth', 'fwidthCoarse', 'fwidthFine', 'greaterThan', 'greaterThanEqual', 'groupMemoryBarrier', 'imageAtomicAdd', 'imageAtomicAnd', 'imageAtomicCompSwap', 'imageAtomicExchange', 'imageAtomicMax', 'imageAtomicMin', 'imageAtomicOr', 'imageAtomicXor', 'imageLoad', 'imageSamples', 'imageSize', 'imageStore', 'imulExtended', 'intBitsToFloat', 'interpolateAtCentroid', 'interpolateAtOffset', 'interpolateAtSample', 'inverse', 'inversesqrt', 'isinf', 'isnan', 'ldexp', 'length', 'lessThan', 'lessThanEqual', 'log', 'log2', 'matrixCompMult', 'max', 'memoryBarrier', 'memoryBarrierAtomicCounter', 'memoryBarrierBuffer', 'memoryBarrierImage', 'memoryBarrierShared', 'min', 'mix', 'mod', 'modf', 'noise', 'noise1', 'noise2', 'noise3', 'noise4', 'normalize', 'not', 'notEqual', 'outerProduct', 'packDouble2x32', 'packHalf2x16', 'packSnorm2x16', 'packSnorm4x8', 'packUnorm', 'packUnorm2x16', 'packUnorm4x8', 'pow', 'radians', 'reflect', 'refract', 'round', 'roundEven', 'sign', 'sin', 'sinh', 'smoothstep', 'sqrt', 'step', 'tan', 'tanh', 'texelFetch', 'texelFetchOffset', 'texture', 'textureGather', 'textureGatherOffset', 'textureGatherOffsets', 'textureGrad', 'textureGradOffset', 'textureLod', 'textureLodOffset', 'textureOffset', 'textureProj', 'textureProjGrad', 'textureProjGradOffset', 'textureProjLod', 'textureProjLodOffset', 'textureProjOffset', 'textureQueryLevels', 'textureQueryLod', 'textureSamples', 'textureSize', 'transpose', 'trunc', 'uaddCarry', 'uintBitsToFloat', 'umulExtended', 'unpackDouble2x32', 'unpackHalf2x16', 'unpackSnorm2x16', 'unpackSnorm4x8', 'unpackUnorm', 'unpackUnorm2x16', 'unpackUnorm4x8', 'usubBorrow', // GLSL ES 1.00 'texture2D', 'textureCube'
    ],
    [ // MARBLE
        'Solid',
    ],
];

const defaultScopeStack: VariableMappingScopeStack = defaultScopeKeys.map(scope => 
    scope.map(identifier => ({ type: 'ignore', identifier })));

class NodeTranspiler {
    private scopes: VariableMappingScopeStack = [ ...defaultScopeStack ];
    private transpiledStatements: AstNode[] = [];

    private outputKey: string;

    constructor(
        private geometry: GeometryS,
        private connectionData: GeometryConnectionData,
        private nodeIndex: number,
        private nodeState: GNodeState,
        private nodeTemplate: GNodeTemplate,
        private definitions: Map<string, TranspilerObject>,
    ) {
        const parameters = nodeTemplate.instructions.prototype.parameters || [];
        const paramIdentifiers = getIdentifierFromParameters(parameters);
        const parameterScope: VariableMappingScope = paramIdentifiers
            .map(paramId => this.getRowInstantiationRule(paramId));
        this.scopes.push(parameterScope);

        this.outputKey = getNodeOutputIdentifier(nodeState.id); // replace with better if neccessary
    }

    public transpile() {
        const body = this.nodeTemplate.instructions.body;
        if (body.statements.length === 0) { return; }
        if (body.statements.length > 1) { notImplemented(); }
        const statement = body.statements[0];
        if (statement.type !== 'expression_statement') {
            debugger
            notImplemented();
        }
        this.transpileExpression(statement.expression);
    }

    public getTranspiledStatements() {
        return this.transpiledStatements;
    }

    private defineOutput(obj: TranspilerObject) {
        if (this.definitions.has(this.outputKey)) {
            throw new Error(`Already defined output`);
        }
        this.definitions.set(this.outputKey, obj);
    }

    private transpileExpression(expressionNode: ExpressionStatementNode['expression'] | LambdaExpressionNode) {
        if (expressionNode.type === 'lambda_expression') {
            this.transpileLambdaExpression(expressionNode as LambdaExpressionNode);
        } else {
            this.transpileNormalExpression(expressionNode);
        }
    }

    private transpileLambdaExpression(lambdaExpression: LambdaExpressionNode) {
        const lambdaParamIdents = getIdentifierFromParameters(lambdaExpression.parameters);
        const ignoreInstructions: VariableMappingScope = lambdaParamIdents
            .map(paramId => ({ type: 'ignore', identifier: paramId }));
        // push ignore list for params of lambda
        this.scopes.push(ignoreInstructions);
        // instantiate lambdas expression body
        const instantiated = this.instantiateExpression(lambdaExpression.expression);
        this.scopes.pop(); // ignoreInstructions

        this.defineOutput({
            type: 'lambda',
            parameters: lambdaExpression.parameters,
            bodyExpression: instantiated,
        });
    }

    private transpileNormalExpression(expressionNode: any) {
        const instantiatedExpression =
            this.instantiateExpression(expressionNode);
        const typeSpec = this.nodeTemplate.instructions.prototype.header.returnType;

        this.defineOutput({
            type: 'variable',
            typeSpecifier: typeSpec,
            identifier: this.outputKey,
        });

        const outputStatement = factory
            .declarationStatement(typeSpec, this.outputKey, instantiatedExpression);

        this.transpiledStatements.push(outputStatement);
    }

    private instantiateExpression(expression: AstNode) {
        // REPLACE WITH PRODUCE
        const clonedExpression = _.cloneDeep(expression);
        visit(clonedExpression, {
            identifier: {
                enter: (path) => {
                    // const parentType = path.parent?.type;
                    // const isExpression = path.parent == null;
                    // const isDirectInitializer = parentType === 'declaration' && path.key === 'initializer';
                    // const isOtherReference = parentType && ['binary', 'function_call', 'postfix', 'return_statement'].includes(parentType);
                    // if (isExpression || isDirectInitializer || isOtherReference) {
                    this.instantiateIdentifier(path);
                    // }
                }
            },
        });
        return clonedExpression;
    }

    private instantiateIdentifier(path: Path<IdentifierNode>) {
        const allRules = this.scopes.flat();
        const rule = findRight(allRules, rule => rule.identifier === path.node.identifier);
        if (!rule) {
            throw new Error(`Identifier "${path.node.identifier}" does not have an instruction.`);
        }
        switch (rule.type) {
            case 'edge':
                this.instantiateEdgeIdentifier(path, rule);
                return;
            case 'constant':
                path.node.identifier = rule.literal;
                return;
            case 'ignore':
                return;
        }
        throw new Error(`Unknown instruction found`);
    }

    private instantiateEdgeIdentifier(path: Path<IdentifierNode>, rule: EdgeRule) {
        const { reference } = rule;
        if (reference.type === 'variable') {
            // TODO: maybe add typechecking here 
            path.node.identifier = reference.identifier;
            return;
        }
        if (reference.type === 'lambda') {
            /**
             * 1. check if reference is function call or reference
             * 2. generate statement for calculating arguments
             * 3. take lambda expression and instantiate with arguments
             * 4. replace function call with lambda return value
             */
            const isFunctionCall = this.isFunctionCallIdentifier(path);
            if (!isFunctionCall) {
                throw new Error(`Cannot reference variable containing lambda`);
            }
            // handle function call
            const functionCall = path.parentPath?.parent as FunctionCallNode;

            const argumentExpressions = functionCall.args
                .filter(arg => arg.type !== 'literal'); // filters commas
            
            // must create statements for all expressions with argument name
        }
    }

    private isFunctionCallIdentifier(path: Path<IdentifierNode>) {
        // @ts-ignore
        return (path.parent?.type === 'simple_type_specifier' && 
                path.parentPath?.parent?.type === 'function_call');
    }

    private getRowInstantiationRule(rowId: string): MappingRule {

        const rowIndex = this.nodeTemplate.rows.findIndex(row => row.id === rowId);
        if (rowIndex < 0) {
            throw new Error(`Row "${rowId}" does not exists on template`);
        }
        const rowTemp = this.nodeTemplate.rows[rowIndex] as BaseInputRowT<DataTypes, RowTypes>;
        if (!rowTemp.dataType) {
            throw new Error(`Must be input row`);
        }
        const rowState = this.nodeState.rows[rowTemp.id];

        // case 1: connection
        const incomingEdges = this.connectionData.backwardEdges[this.nodeIndex]?.[rowIndex] || []

        // // 1.1 stacked input
        // if (rowTemp.type === 'input_stacked') {
        //     const parentType = path.parent?.type;
        //     if (parentType !== 'function_call') {
        //         throw new Error(`Stacked row identifier must be argument of function call`);
        //     }
        //     const [defaultLiteralTree] = path.parent.args;
        //     const functionName = (path.parent.identifier as any)?.specifier?.identifier;
        //     if (functionName == null) {
        //         throw new Error(`Function name null`);
        //     }
        //     const size = Object.keys(incomingEdges).length;
        //     if (size === 0) {
        //         const anyParent = path.parent as any;
        //         for (const key in path.parent) {
        //             delete anyParent[key];
        //         }
        //         Object.assign(anyParent, defaultLiteralTree);
        //         return;
        //     }
        //     // create stacked input
        //     let expr = '';
        //     for (let i = 0; i < size; i++) {
        //         const jointEdge = incomingEdges[i];
        //         const identifier = this.getIdentifierName(Prefixes.Edge, ...jointEdge.fromIndices);
        //         if (i == 0) {
        //             expr = identifier;
        //         } else {
        //             expr = `${functionName}(${expr},${identifier})`;
        //         }
        //     }
        //     const identifierNode: IdentifierNode = {
        //         type: 'identifier',
        //         identifier: expr,
        //         whitespace: '',
        //     };
        //     const anyParent = path.parent as any;
        //     for (const key in path.parent) {
        //         delete anyParent[key];
        //     }
        //     Object.assign(anyParent, identifierNode);
        //     return;
        // }

        // 1.2 single incoming edge
        if (incomingEdges[0] != null) {
            const jointEdge = incomingEdges[0];
            const [fromNodeIndex] = jointEdge.fromIndices;
            const fromNode = this.geometry.nodes[fromNodeIndex];
            const outputIdentifier = getNodeOutputIdentifier(fromNode.id);
            const reference = this.definitions.get(outputIdentifier);
            if (!reference) {
                throw new Error(`Cannot reference "${outputIdentifier}"`);
            }
            return { type: 'edge', identifier: rowId, reference }
        }

        //     // case 2.1: argument connected
        //     const incomingArg = rowState?.incomingElements?.[0];
        //     if (incomingArg?.type === 'argument') {
        //         path.node.identifier = incomingArg.argument;
        //         return;
        //     }

        //     // case 2.2 argument fallback
        //     if (rowTemp.defaultArgumentToken != null) {
        //         path.node.identifier = rowTemp.defaultArgumentToken;
        //         return;
        //     }

        //     const rowMetadata = getRowMetadata({
        //         state: rowState,
        //         template: rowTemp as BaseInputRowT,
        //         numConnectedJoints: 0
        //     });

        //     // case 3: parameter texture lookup
        //     if (rowMetadata.dynamicValue) {
        //         const dynamicId = this.getIdentifierName(Prefixes.Dynamic, this.nodeIndex, rowIndex);
        //         path.node.identifier = dynamicId;
        //         if (!this.definedLocals.has(dynamicId)) {
        //             this.definedLocals.add(dynamicId);
        //             // DECLARATION
        //             const size = textureVarDatatypeSize[rowTemp.dataType];
        //             const textureCoordinate = this.textureCoordinateCounter.nextInts(size);
        //             const textureLookupCode = formatTextureLookupStatement(dynamicId, textureCoordinate, rowTemp.dataType);
        //             this.addDeclarationInfront(path, textureLookupCode);
        //             // VAR MAPPING
        //             this.textureVarMappings.push({
        //                 dataType: rowTemp.dataType,
        //                 textureCoordinate,
        //                 geometryId: geometry.id,
        //                 geometryVersion: geometry.version,
        //                 nodeIndex: this.nodeIndex,
        //                 rowIndex,
        //             });
        //         }
        //         return;
        //     }

        // case 4: fixed constant
        const value = (rowState as RowS<BaseInputRowT>)?.value ?? rowTemp.value;
        const valueLiteral = formatLiteral(value, rowTemp.dataType);
        return {
            type: 'constant',
            identifier: rowId,
            literal: valueLiteral,
        }
    }
}