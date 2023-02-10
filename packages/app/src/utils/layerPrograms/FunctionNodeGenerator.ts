import { AstNode, CompoundStatementNode, DeclarationNode, DeclarationStatementNode, ExpressionStatementNode, FullySpecifiedTypeNode, FunctionNode, FunctionPrototypeNode, IdentifierNode, LiteralNode, NodeVisitor, NodeVisitors, Path, TypeSpecifierNode, visit } from "@shaderfrog/glsl-parser/ast";
import _, { isArray } from "lodash";
import { BaseInputRowT, DataTypes, GeometryConnectionData, GeometryEdge, GeometryS, GeometrySignature, GNodeState, GNodeTemplate, ObjMap, OutputRowT, RowS, RowTypes } from "../../types";
import { formatLiteral } from "./generateCodeStatements";

class AstNodeFactory {
    public literal(literal: string, whitespace = ' '): LiteralNode {
        return { type: 'literal', literal, whitespace }
    }
    public identifier(identifier: string, whitespace = ' '): IdentifierNode {
        return { type: 'identifier', identifier, whitespace }
    }
    public declaration(typeSpec: FullySpecifiedTypeNode, identifier: string, expression: any): DeclarationStatementNode {
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

interface LambdaDefinition {
    type: 'lambda_definition';
    parameters: FunctionPrototypeNode['parameters'];
    bodyExpression: AstNode;
}

interface VariableDefinition {
    type: 'variable_definition';
    dataType: DataTypes;
    identifier: string;
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

type OutputJointIdenfifier = `o_${string}_${string}`;

interface NodeInfo {
    index: number;
    state: GNodeState;
    template: GNodeTemplate;
}

interface EdgeVariableMapping {
    type: 'edge';
    outputIdentifier: string;
}
interface ConstantMapping {
    type: 'constant';
    literal: string;
}
interface IgnoreVariableMapping {
    type: 'ignore';
}

type VariableMapping = EdgeVariableMapping | ConstantMapping | IgnoreVariableMapping;
type VariableMap = ObjMap<VariableMapping>; // false=skip

export default class FunctionNodeGenerator {

    // private nodeIndex = -1;
    // private definedLocals = new Set<string>();
    // private additionalStatements: Array<{
    //     location: StatementLocation;
    //     node: LiteralNode;
    // }> = [];
    // private textureCoordinateCounter;
    // private textureVarMappings: ProgramTextureVarMapping[] = [];

    private definedVariables = new Map<OutputJointIdenfifier, VariableDefinition>();
    private definedLambdas = new Map<OutputJointIdenfifier, LambdaDefinition>();
    private functionStatements: AstNode[] = [];

    constructor(
        private geometry: GeometryS,
        private connectionData: GeometryConnectionData,
        private signature: GeometrySignature,
        // props: { textureVarRowIndex: number }
    ) {
        // const counterOffset = props.textureVarRowIndex * LOOKUP_TEXTURE_WIDTH;
        // this.textureCoordinateCounter = new Counter(LOOKUP_TEXTURE_WIDTH, counterOffset);
    }

    private appendStatements(astNodes: AstNode[]) {
        this.functionStatements.push(...astNodes);
    }

    private getOutputJointIdentifier(nodeId: string, rowId: string): OutputJointIdenfifier {
        return `o_${nodeId}_${rowId}`;
    }

    private getOutputJointFromEdge(edge: GeometryEdge) {
        const [ nodeIndex, rowIndex ] = edge.fromIndices;
        const node = this.geometry.nodes[nodeIndex];
        const row = this.connectionData.nodeDatas[nodeIndex]!.template.rows[rowIndex];
        return this.getOutputJointIdentifier(node.id, row.id);
    }

    public processNode(info: NodeInfo): void {
        const { state, template } = info;

        const outputRow = template.rows.find(row => row.type === 'output') as OutputRowT;
        if (!outputRow) {
            // node is output
            this.processOutputNode(info);
            return;
        }
        const outputJointKey = this.getOutputJointIdentifier(state.id, outputRow.id);

        const visitors: ExtendedNodeVisitors = {
            declaration_statement: {
                enter: path => {
                    throw new Error(`Implement`);
                },
            },
            return_statement: {
                enter: path => {
                    throw new Error(`Implement`);
                },
            },
            expression_statement: {
                exit: path => {
                    const varDef: VariableDefinition = {
                        type: 'variable_definition',
                        dataType: outputRow.dataType,
                        identifier: outputJointKey,
                    };
                    if (this.definedVariables.has(outputJointKey)) {
                        throw new Error(`Var already defined`);
                    }
                    this.definedVariables.set(outputJointKey, varDef);
                    const returnType = factory.fullySpecifiedType(outputRow.dataType);
                    const declaration = factory.declaration(returnType, outputJointKey, path.node.expression);
                    Object.assign(path.node, declaration);
                },
            },
            lambda_expression: {
                enter: path => {
                    const parentExpression = path.parent as ExpressionStatementNode;
                    if (parentExpression.type !== "expression_statement") {
                        throw new Error(`Implement`);
                    }
                    const compoundStatement = path.parentPath?.parentPath?.node as AstNode;
                    if (compoundStatement?.type !== 'compound_statement') {
                        throw new Error(`Parentparent is ${compoundStatement.type}`);
                    }
                    // remove statement
                    compoundStatement.statements = 
                        compoundStatement.statements.filter(s => s !== parentExpression);

                    const variableMap = this.getVariableMap(info);
                    const lambdaParamIdents = this.getIdentifierFromParameters(path.node.parameters);
                    for (const param of lambdaParamIdents) {
                        variableMap[param] = { type: 'ignore' };
                    }
                    // instantiate lambdas expression body
                    const instantiated = this.instantiateExpression(path.node.expression, variableMap);

                    if (this.definedLambdas.has(outputJointKey)) {
                        throw new Error(`Lambda already defined`);
                    }
                    this.definedLambdas.set(outputJointKey, {
                        type: 'lambda_definition',
                        parameters: path.node.parameters,
                        bodyExpression: instantiated,
                    });
                }
            }
        };

        // REPLACE WITH PRODUCE
        const clonedCompoundNode = _.cloneDeep(template.instructions.body);
        visit(clonedCompoundNode, visitors);
        // const originalCompoundNode = nodeTemplate.instructions.body;
        // const processedCompoundNode = produce(originalCompoundNode, draftNode => {
        //     visit(draftNode, visitors);
        // });
        this.appendStatements(clonedCompoundNode.statements);


        
            // identifier: {
            //     enter: (path) => {
            //         const parentType = path.parent!.type;
            //         const isDirectInitializer = parentType === 'declaration' && path.key === 'initializer';
            //         const isOtherReference = [ 'binary', 'function_call', 'postfix', 'return_statement' ].includes(parentType);
            //         if (isDirectInitializer || isOtherReference) {
            //             this.visitReferenceIdentifier(path, nodeState, nodeTemplate);
            //         }
            //     }
            // },
    }

    private processOutputNode(info: NodeInfo) {

    }

    private instantiateExpression(expression: AstNode, variableMap: VariableMap) {

        // REPLACE WITH PRODUCE
        const clonedExpression = _.cloneDeep(expression);
        visit(clonedExpression, {
            identifier: {
                enter: (path) => {
                    const parentType = path.parent!.type;
                    const isDirectInitializer = parentType === 'declaration' && path.key === 'initializer';
                    const isOtherReference = [ 'binary', 'function_call', 'postfix', 'return_statement' ].includes(parentType);
                    if (isDirectInitializer || isOtherReference) {
                        if (Object.hasOwn(variableMap, path.node.identifier)) {
                            const mapping = variableMap[path.node.identifier];
                            if (mapping.type == 'edge') {
                                path.node.identifier = mapping.outputIdentifier;
                            } else if (mapping.type === 'constant') {
                                path.node.identifier = mapping.literal;
                            } else if (mapping.type !== 'ignore') {
                                throw new Error(`Implement`)
                            }
                        } else {
                            throw new Error(`Identifier ${path.node.identifier} is not available nor defined`);
                        }
                    }
                }
            },
        });
        return clonedExpression;
    }

    private getIdentifierFromParameters(params: any /* TODO */): string[] {
        const identifiers = params
            .map((param: any /* TODO */) => param.declaration.identifier.identifier);

        if (!isArray(identifiers)) {
            throw new Error(`Params not array, maybe no params`);
        }

        return identifiers;
    }

    private getVariableMap(info: NodeInfo): VariableMap {

        const map: VariableMap = {};
        const parameters = info.template.instructions.prototype.parameters;
        const paramIdentifiers = this.getIdentifierFromParameters(parameters);

        for (const paramId of paramIdentifiers) {
            map[paramId] = this.getRowMapping(paramId, info);
        }
        return map;
    }

    // private processLambdaNode(nodeState: GNodeState, nodeTemplate: GNodeTemplate): void {

    //     const { instructions: functionNode } = nodeTemplate;

    //     const header = functionNode.prototype.header;

    //     // @ts-ignore TODO
    //     const lambdaTypeSpecifier: LambdaTypeSpecifierNode = header.returnType.specifier;

    //     const lambdaExpression =


    //     const lambda: LambdaDefinition = {
    //         typeSpecifier: lambdaTypeSpecifier,
    //         bodyExpression,
    //     }


    //     if (this.definedLambdas.has(hashKey)) {
    //         throw new Error(`Lambda already defined`);
    //     }
    //     this.definedLambdas.set(hashKey, lambda);
    // }

    public generateFunctionNode(): FunctionNode {

        
        console.log(this.definedLambdas);
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

    // public setGeometryScope(geometry: GeometryS, connectionData: GeometryConnectionData) {
    //     this.geometry = geometry;
    //     this.connectionData = connectionData;
    //     this.definedLocals.clear();
    // }

    // public setNodeScope(nodeIndex: number) {
    //     this.nodeIndex = nodeIndex;
    // }

    public getGeometry() {
        return { geometry: this.geometry, connectionData: this.connectionData };
    }

    // public getNode() {
    //     const { geometry, connectionData } = this.getGeometry();
    //     const node = geometry.nodes[this.nodeIndex];
    //     const nodeData = connectionData.nodeDatas[this.nodeIndex];
    //     if (!node || !nodeData) {
    //         throw new Error(`Node not set in Renamer`);
    //     }
    //     return { node, nodeData };
    // }

    // public addAdditionalStatements(astRoot: Program) {

    //     while (this.additionalStatements.length) {
    //         // loop over statements in reverse over by popping
    //         const { location, node } = this.additionalStatements.pop()!;

    //         const functionNode = astRoot.program[location.functionIndex];
    //         if (functionNode.type !== 'function') {
    //             throw new Error(`Not a function`);
    //         }

    //         const compound: CompoundStatementNode = functionNode.body;

    //         // insert into array before index
    //         compound.statements = [
    //             ...compound.statements.slice(0, location.statementIndex),
    //             node,
    //             ...compound.statements.slice(location.statementIndex),
    //         ]
    //     }
    // }

    // public getTextureVarMappings() {
    //     return this.textureVarMappings;
    // }

    // private getIdentifierName(prefix: string, ...data: (number | string)[]) {
    //     return [prefix, ...data].join('_');
    // }

    private getIncomingEdge(nodeIndex: number, rowIndex: number) {
        return this.connectionData.backwardEdges[nodeIndex]?.[rowIndex] || [];
    }

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

    private getRowMapping(rowId: string, info: NodeInfo): VariableMapping {
        const { index: nodeIndex, state: nodeState, template: nodeTemplate } = info;

        const rowIndex = nodeTemplate.rows.findIndex(row => row.id === rowId);
        if (rowIndex < 0) {
            throw new Error(`Row "${rowId}" does not exists on template`);
        }
        const rowTemp = nodeTemplate.rows[rowIndex] as BaseInputRowT<DataTypes, RowTypes>;
        if (!rowTemp.dataType) {
            throw new Error(`Must be input row`);
        }
        const rowState = nodeState.rows[rowTemp.id];
        
        // case 1: connection
        const incomingEdges = this.getIncomingEdge(nodeIndex, rowIndex);

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
            const outputIdentifier = this.getOutputJointFromEdge(jointEdge);
            return {
                type: 'edge',
                outputIdentifier,
            }
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
            literal: valueLiteral,
        }
    }

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