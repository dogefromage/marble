import { AstNode, CompoundStatementNode, DeclarationNode, DeclarationStatementNode, ExpressionStatementNode, FullySpecifiedTypeNode, FunctionNode, FunctionPrototypeNode, IdentifierNode, LiteralNode, NodeVisitor, NodeVisitors, Path, TypeSpecifierNode, visit } from "@shaderfrog/glsl-parser/ast";
import _, { isArray } from "lodash";
import { BaseInputRowT, DataTypes, GeometryConnectionData, GeometryEdge, GeometryS, GeometrySignature, GNodeState, GNodeTemplate, ObjMap, RowS, RowTypes } from "../../types";
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

function getIdentifierFromParameters(params: any /* TODO */): string[] {
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

interface LambdaDefinition {
    type: 'lambda_definition';
    parameters: FunctionPrototypeNode['parameters'];
    bodyExpression: AstNode;
}
interface VariableDefinition {
    type: 'variable_definition';
    typeSpecifier: DataTypes;
    identifier: string;
}
type Definition = LambdaDefinition | VariableDefinition;

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

interface EdgeRule {
    type: 'edge';
    outputIdentifier: string;
}
interface ConstantRule {
    type: 'constant';
    literal: string;
}
interface IgnoreRule {
    type: 'ignore';
}
type MappingRule = EdgeRule | ConstantRule | IgnoreRule;
type VariableMappingScope = Map<string, MappingRule>;
type VariableMappingScopeStack = VariableMappingScope[];

export default class FunctionNodeGenerator {

    // private textureCoordinateCounter;
    // private textureVarMappings: ProgramTextureVarMapping[] = [];

    // private definedVariables = new Map<OutputJointIdenfifier, VariableDefinition>();
    // private definedLambdas = new Map<OutputJointIdenfifier, LambdaDefinition>();
    private functionStatements: AstNode[] = [];
    private definitions = new Map<string, Definition>();

    constructor(
        private geometry: GeometryS,
        private connectionData: GeometryConnectionData,
        private signature: GeometrySignature,
        // props: { textureVarRowIndex: number }
    ) {
        // const counterOffset = props.textureVarRowIndex * LOOKUP_TEXTURE_WIDTH;
        // this.textureCoordinateCounter = new Counter(LOOKUP_TEXTURE_WIDTH, counterOffset);
    }

    public processNode(info: NodeInfo): void {
        const { index, state, template } = info;

        const nodeTranspiler = new NodeTranspiler(
            this.geometry, this.connectionData,
            index, state, template, 
            this.definitions,
        );

        const statements = nodeTranspiler.transpile();

        const functionBody = template.instructions.body;
        const bodyStatements = this.transpileBody(info, functionBody);

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

    public generateFunctionNode(): FunctionNode {


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

class NodeTranspiler {
    private baseMappingScope: VariableMappingScope = new Map();

    constructor(
        private geometry: GeometryS,
        private connectionData: GeometryConnectionData,
        private nodeIndex: number,
        private nodeState: GNodeState,
        private nodeTemplate: GNodeTemplate,
        private definitions: Map<string, Definition>,
    ) {
        const parameters = nodeTemplate.instructions.prototype.parameters;
        const paramIdentifiers = getIdentifierFromParameters(parameters);
        for (const paramId of paramIdentifiers) {
            this.baseMappingScope.set(paramId, this.getRowInstantiationRule(paramId))
        }
    }
    
    public transpile(body: CompoundStatementNode): AstNode[] {
        if (body.statements.length === 0) { return []; }
        if (body.statements.length > 1) { notImplemented(); }

        const statement = body.statements[0] as ExpressionStatementNode;
        if (statement.type !== 'expression_statement') {
            notImplemented();
        }
        return this.transpileExpression(statement.expression);
    }

    private transpileExpression(expressionNode: ExpressionStatementNode['expression'] | LambdaExpressionNode): AstNode[] {
        if (expressionNode.type === 'lambda_expression') {
            return this.transpileLambdaExpression(expressionNode as LambdaExpressionNode);
        } else {
            return this.transpileNormalExpression(expressionNode);
        }
    }

    private transpileLambdaExpression(lambdaExpression: LambdaExpressionNode): AstNode[] {
        const lambdaParamIdents = getIdentifierFromParameters(lambdaExpression);
        const ignoreInstructions: VariableMappingScope = new Map();
        for (const paramId of lambdaParamIdents) {
            ignoreInstructions.set(paramId, { type: 'ignore' });
        }
        const instructionStack = [ this.baseMappingScope, ignoreInstructions ];

        // instantiate lambdas expression body
        const instantiated = this.instantiateExpression(lambdaExpression.expression, instructionStack);

        const key = this.nodeState.id; // maybe replace with more specific key

        if (this.definitions.has(key)) {
            throw new Error(`Lambda already defined`);
        }
        this.definitions.set(key, {
            type: 'lambda_definition',
            parameters: lambdaExpression.parameters,
            bodyExpression: instantiated,
        });

        return []; // lambda is not written as statement, it is *remembered*
    }

    private transpileNormalExpression(expressionNode: any): AstNode[] {

    }

    private instantiateExpression(expression: AstNode, scopeStack: VariableMappingScopeStack) {
        // REPLACE WITH PRODUCE
        const clonedExpression = _.cloneDeep(expression);
        visit(clonedExpression, {
            identifier: {
                enter: (path) => {
                    const parentType = path.parent!.type;
                    const isDirectInitializer = parentType === 'declaration' && path.key === 'initializer';
                    const isOtherReference = ['binary', 'function_call', 'postfix', 'return_statement'].includes(parentType);
                    if (isDirectInitializer || isOtherReference) {
                        this.instantiateIdentifier(path.node, scopeStack);
                    }
                }
            },
        });
        return clonedExpression;
    }

    private instantiateIdentifier(node: IdentifierNode, scopeStack: VariableMappingScopeStack) {

        let instruction: MappingRule | undefined;
        for (const scope of scopeStack.slice().reverse()) {
            if (scope.has(node.identifier)) {
                instruction = scope.get(node.identifier);
                break;
            }
        }
        if (!instruction) {
            throw new Error(`Identifier "${node.identifier}" does not have an instruction.`);
        }
        
        switch (instruction.type) {
            case 'edge':
                node.identifier = instruction.outputIdentifier;
                return;
            case 'constant':
                node.identifier = instruction.literal;
                return;
            case 'ignore':
                return;
        }
        throw new Error(`Unknown instruction found`);
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
            const [ fromNodeIndex ] = jointEdge.fromIndices;
            const fromNode = this.geometry.nodes[fromNodeIndex];
            const outputIdentifier = getNodeOutputIdentifier(fromNode.id);
            return { type: 'edge', outputIdentifier }
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
}