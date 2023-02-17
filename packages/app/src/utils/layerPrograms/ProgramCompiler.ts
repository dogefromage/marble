import { parse as parseMarbleLanguage } from '@marble/language';
import { generate as generateGlslCode } from '@shaderfrog/glsl-parser';
import { AstNode, FunctionNode, IdentifierNode, ReturnStatementNode } from "@shaderfrog/glsl-parser/ast";
import { Path, Program, Scope, ScopeIndex, visit } from '@shaderfrog/glsl-parser/ast/ast';
import _ from 'lodash';
import { BaseInputRowT, DataTypes, decomposeTemplateId, DependencyGraph, GeometryConnectionData, GeometryS, getDependencyKey, GNodeState, GNodeTemplate, LambdaExpressionNode, LambdaTypeSpecifierNode, Layer, LayerProgram, ObjMapUndef, ProgramInclude, RowS, RowTypes, splitDependencyKey } from "../../types";
import analyzeGraph from '../analyzeBasicGraph';
import topSortDependencies from '../dependencyGraph/topSortDependencies';
import geometryNodesToGraphAdjacency from "../geometries/geometryNodesToGraphAdjacency";
import { LOOKUP_TEXTURE_WIDTH } from '../viewportView/GLProgramRenderer';
import AstUtils from './AstUtils';
import { parseValue } from './generateCodeStatements';

export default class ProgramCompiler {

    public compileProgram(args: {
        layer: Layer,
        geometries: ObjMapUndef<GeometryS>,
        geometryDatas: ObjMapUndef<GeometryConnectionData>,
        dependencyGraph: DependencyGraph,
        includes: ObjMapUndef<ProgramInclude>,
        textureVarRowIndex: number,
    }): LayerProgram | null {
        const { layer, geometries, geometryDatas, dependencyGraph, includes, textureVarRowIndex } = args;

        const rootLayerKey = getDependencyKey(layer.id, 'layer');
        const rootOrder = dependencyGraph.order.get(rootLayerKey);
        if (rootOrder?.state !== 'met') {
            return null;
            // throw new Error(`Not all dependencies of this layer are met`);
        }
        const topSortAll = topSortDependencies(rootLayerKey, dependencyGraph);
        if (!topSortAll) {
            throw new Error(`Topological sorting not possible`);
        }
        const topologicalGeometrySorting = topSortAll
            .filter(key => splitDependencyKey(key).type === 'geometry')
            .map(key => splitDependencyKey(key).id);

        const geometryFunctions: FunctionNode[] = [];

        for (const geoId of topologicalGeometrySorting) {
            const geoOrderEl = dependencyGraph.order.get(getDependencyKey(geoId, 'geometry'))!;
            const geo = geometries[geoId];
            const data = geometryDatas[geoId];

            if (!geo || !data || geo.version != geoOrderEl.version || geo.version != data.geometryVersion) {
                return null;
                // throw new Error(`Data version outdated or missing`);
            }

            const extendedFunctionProgram = this.functionNodeFromGeometry(geo, data);
            const glslFunctionProgram = this.evaluateAllLambdas(extendedFunctionProgram);
            const functionNode = glslFunctionProgram.program[0] as FunctionNode;
            geometryFunctions.push(functionNode);
        }

        const programAst: Program = {
            type: 'program',
            program: geometryFunctions,
            scopes: [],
        }

        const generatedCode = generateGlslCode(programAst);
        console.info(generatedCode);

        // const usedIncludes = new Set<string>(); // TODO
        // const usedIncludesArr = [...usedIncludes].map(incId => {
        //     const inc = includes[incId];
        //     if (!inc) {
        //         throw new Error(`Include ${incId} is missing!`);
        //     }
        //     return inc;
        // });
        const layerOrderEl = dependencyGraph.order.get(rootLayerKey);
        const layerHash = layerOrderEl!.hash;

        const rootGeometryId = topologicalGeometrySorting.at(-1)!;
        const rootFunctionName = this.getGeometryMethodName(rootGeometryId);

        return {
            id: layer.id,
            index: layer.index,
            name: layer.name,
            hash: layerHash,
            mainProgramCode: generatedCode,
            includes: [], //usedIncludesArr,
            rootFunctionName,
            textureVarMappings: [], // TODO
            textureVarRowIndex,
            textureVarRow: new Array(LOOKUP_TEXTURE_WIDTH).fill(0), // TODO
        }
    }

    private evaluateAllLambdas(program: Program) {
        const func = program.program[0] as FunctionNode;
        const funcScope = program.scopes
            .find(scope => scope.name === func.prototype.header.name.identifier)!;

        // TODO: params of geometry function

        // convert lambda return type to lambda call
        const returnTypeSpec = func.prototype.header.returnType.specifier as any;
        if (returnTypeSpec.type === 'lambda_type_specifier') {
            const lambdaType = returnTypeSpec as LambdaTypeSpecifierNode;
            const callIdentifierList: IdentifierNode[] = [];
            // add lambda args to function prototype
            for (let argIndex = 0; argIndex < lambdaType.args.length; argIndex++) {
                const argTypeSpec = lambdaType.args[argIndex];
                const argIdentifier = this.getReturnLambdaArgumentIdentifier(argIndex);
                const declarationIdentifier = AstUtils.createIdentifier(argIdentifier);
                const callIdentifier = AstUtils.createIdentifier(argIdentifier);
                callIdentifierList.push(callIdentifier);
                const paramDeclaration = AstUtils.createParameterDeclaration(argTypeSpec, declarationIdentifier);
                // push function argument
                const funcParams = func.prototype.parameters || (func.prototype.parameters = [])
                funcParams.push(paramDeclaration);
                // add scope binding
                if (funcScope.bindings[argIdentifier]) {
                    throw new Error(`Identifier "${argIdentifier}" already declared`);
                }
                funcScope.bindings[argIdentifier] = { references: [ paramDeclaration ] };
            }
            // find lambda return statement
            const lastStatementIndex = func.body.statements.length - 1;
            const returnStatement = func.body.statements[lastStatementIndex] as ReturnStatementNode;
            if (returnStatement.type !== 'return_statement') {
                throw new Error(`Last statement is not return statement`);
            }
            // sandwich function call
            const returnIdentifier = returnStatement.expression as IdentifierNode;
            const functionSpecType = AstUtils.createTypeSpecifierNode(returnIdentifier);
            const functionCallNode = AstUtils.createFunctionCall(functionSpecType, callIdentifierList);
            returnStatement.expression = functionCallNode;
            // change function return type
            const returnTypeIdentifier = lambdaType.return_type as IdentifierNode;
            returnTypeIdentifier.whitespace = ' ';
            func.prototype.header.returnType.specifier = 
                AstUtils.createTypeSpecifierNode(returnTypeIdentifier);
        }
        
        const oldStatements = func.body.statements;
        const newStatements = func.body.statements = [] as any[] /* TODO types */;
        const lambdaDeclarations = new Map<string, {
            lambdaExpression: LambdaExpressionNode;
            lambdaScope?: Scope;
            lambdaTypeSpecifier: LambdaTypeSpecifierNode;
        }>();

        let lambdaInstantiationCounter = 0;

        while (oldStatements.length) {
            const statement = oldStatements.shift() as any /* TODO statement */;
            const typeSpecNode = statement.declaration?.specified_type?.specifier;
            if (typeSpecNode?.type === 'lambda_type_specifier') {
                // register lambdas
                const lambdaExpression = statement.declaration.declarations[0].initializer as LambdaExpressionNode;
                if (lambdaExpression.type !== 'lambda_expression') {
                    throw new Error(`Lambda declaration was not initialized by lambda expression`);
                }
                const declarationIdentifier = statement.declaration.declarations[0].identifier.identifier;
                const lambdaScope = program.scopes.find(scope => scope.name === lambdaExpression.header.name);
                // if (!lambdaScope) {
                //     throw new Error(`Scope "${lambdaExpression.header.name} not found"`);
                // }
                lambdaDeclarations.set(declarationIdentifier, {
                    lambdaExpression, 
                    lambdaScope,
                    lambdaTypeSpecifier: typeSpecNode,
                });
            } else {
                // check for lambda reference
                visit(statement, {
                    function_call: {
                        exit: path => {
                            const functionCall = path.node;
                            const identifier = (path.node.identifier as any).specifier.identifier as string;
                            if (!lambdaDeclarations.has(identifier)) {
                                return;
                            }
                            // instantiate expression
                            const lambdaTemplate = lambdaDeclarations.get(identifier)!;
                            const lambdaInstance = _.cloneDeep(lambdaTemplate);
                            const { lambdaExpression, lambdaScope, lambdaTypeSpecifier } = lambdaInstance;
                            // create declaration and rename
                            const argumentExpressions  = functionCall.args
                                .filter((arg: any) => arg.type !== 'literal') as any[]; // filter commas
                            const paramList = AstUtils.getParameterIdentifiers(lambdaExpression.header.parameters);
                            if (argumentExpressions.length !== paramList.length) {
                                throw new Error(`Wrong amount of arguments for lambda`);
                            }
                            const lambdaIndex = lambdaInstantiationCounter++;
                            for (let paramIndex = 0; paramIndex < paramList.length; paramIndex++) {
                                // declaration statement
                                const [ typeSpec, paramIdentifier ] = paramList[paramIndex];
                                const fullTypeSpec = AstUtils.createFullySpecifiedType(typeSpec);
                                const newIdentifier = `_lambda_${lambdaIndex}_arg_${paramIndex}`;
                                const argumentExpression = argumentExpressions[paramIndex];
                                const declaration = AstUtils.createDeclaration(newIdentifier, argumentExpression);
                                const declarationStatement = AstUtils.createDeclarationStatement(fullTypeSpec, declaration);
                                newStatements.push(declarationStatement);
                                // binding
                                if (funcScope.bindings[newIdentifier]) {
                                    throw new Error(`Binding already defined`);
                                }
                                const newBinding: ScopeIndex[0]
                                    = funcScope.bindings[newIdentifier]
                                    = { references: [ declarationStatement ] }
                                // rename 
                                if (lambdaScope) {
                                    const referencesOnly = lambdaScope.bindings[paramIdentifier]!.references
                                        .filter(reference => !lambdaExpression.header.parameters.includes(reference));
                                    this.renameBinding(referencesOnly, newIdentifier);
                                    newBinding.references.push(...referencesOnly);
                                }
                            }
                            // declare lambda return value
                            const lambdaReturnType = lambdaTypeSpecifier.return_type;
                            const lambdaReturnTypeSpec = AstUtils.createTypeSpecifierNode(lambdaReturnType);
                            const fullTypeSpec = AstUtils.createFullySpecifiedType(lambdaReturnTypeSpec);
                            const lambdaValueIdentifier = `lambda_${lambdaIndex}_out`;
                            const declaration = AstUtils.createDeclaration(lambdaValueIdentifier, lambdaExpression.body);
                            const declarationStatement = AstUtils.createDeclarationStatement(fullTypeSpec, declaration);
                            newStatements.push(declarationStatement);
                            // create identifier
                            // remove all props and copy
                            const targetIdentifierNode = functionCall as any;
                            for (const key in targetIdentifierNode) {
                                delete targetIdentifierNode[key];
                            }
                            Object.assign(targetIdentifierNode, AstUtils.createIdentifier(lambdaValueIdentifier));

                            if (funcScope.bindings[lambdaValueIdentifier]) {
                                throw new Error(`Binding already defined`);
                            }
                            funcScope.bindings[lambdaValueIdentifier] = { references: [ declarationStatement, targetIdentifierNode ] };
                        }
                    }
                });
                newStatements.push(statement);
            }
        }

        return program;
    }

    private functionNodeFromGeometry(
        geometry: GeometryS,
        connectionData: GeometryConnectionData,
    ) {
        const n = geometry.nodes.length;
        const nodeAdjacency = geometryNodesToGraphAdjacency(n, connectionData.forwardEdges);
        const graphAnalysis = analyzeGraph(n, nodeAdjacency);
        const { topologicalSorting, cycles, components } = graphAnalysis;

        if (cycles.length) {
            throw new Error(`Cyclic nodes found while compiling geometry.`);
        }

        // find lowest index where a node is output
        let outputIndex = -1;
        for (let i = geometry.nodes.length - 1; i >= 0; i--) {
            const { id: templateIdentifier, type: templateType } = decomposeTemplateId(geometry.nodes[i].templateId);
            if (geometry.id === templateIdentifier && templateType === 'output') {
                outputIndex = i;
                break;
            }
        }
        if (outputIndex < 0) {
            throw new Error(`Geometry does not have an output.`);
        }
        const outputComponent = components[outputIndex];
        const usedOrderedNodeIndices = topologicalSorting
            .filter(nodeIndex => components[nodeIndex] == outputComponent);

        const methodName = this.getGeometryMethodName(geometry.id);
        
        const geoProgram = AstUtils.createBlankGeometryProgram(geometry, methodName);
        const geoFunc = geoProgram.program[0] as FunctionNode;
        const geoScope = geoProgram.scopes.find(scope => scope.name === geoFunc.prototype.header.name.identifier)!;
        const geoStatements = geoFunc.body.statements;

        for (const nodeIndex of usedOrderedNodeIndices) {
            const isOutput = nodeIndex === outputIndex;

            const nodeState = geometry.nodes[nodeIndex];
            const nodeData = connectionData.nodeDatas[nodeIndex];
            if (!nodeData) {
                throw new Error(`A required template is missing.`);
            }
            const templateProgram = this.getTemplateProgramInstance(nodeData.template);
            const templateFunctionNode = templateProgram.program[0] as FunctionNode;
            const templateScope = templateProgram.scopes.find(scope => 
                scope.name === templateFunctionNode.prototype.header.name.identifier)!;

            if (!isOutput) {
                const nodeOutputIdentifier = this.getNodeOutputIdentifier(nodeIndex);
                this.replaceReturnWithDeclaration(templateProgram, nodeOutputIdentifier);
            }

            const paramDeclarations = AstUtils.getParameterIdentifiers(templateFunctionNode.prototype.parameters);
            for (const [ paramTypeSpecNode, paramIdentifier ] of paramDeclarations) {
                const paramBindings = templateScope.bindings[paramIdentifier];
                delete templateScope.bindings[paramIdentifier]; // loop over remaining later
                const referencesWithoutDeclaration = paramBindings.references.filter(
                    astNode => !templateFunctionNode.prototype.parameters.includes(astNode)
                );

                const linkingRule = this.getRowLinkingRule(
                    geometry, connectionData, nodeState, nodeData.template, nodeIndex, paramIdentifier);

                if (linkingRule.type === 'edge') {
                    const { from } = linkingRule;
                    const fromOutputIdentifier = this.getNodeOutputIdentifier(from.nodeIndex);
                    const targetBinding = geoScope.bindings[fromOutputIdentifier];
                    if (!targetBinding) {
                        throw new Error(`Undeclared binding for identifier "${fromOutputIdentifier}"`);
                    }
                    this.renameBinding(referencesWithoutDeclaration, fromOutputIdentifier);
                    targetBinding.references.push(...referencesWithoutDeclaration);
                    
                } else if (linkingRule.type === 'expression') {
                    const { expression, to } = linkingRule;
                    const localIdentifier = this.getConstIdentifier(to);
                    const declarationNode = AstUtils.createDeclaration(localIdentifier, expression);
                    const fullySpecTypeNode = AstUtils.createFullySpecifiedType(paramTypeSpecNode);
                    const declarationStmtNode = AstUtils.createDeclarationStatement(fullySpecTypeNode, declarationNode);
                    if (geoScope.bindings[localIdentifier]) {
                        throw new Error(`Binding "${localIdentifier}" already defined`);
                    }
                    geoScope.bindings[localIdentifier] = {
                        references: [ declarationStmtNode, ...referencesWithoutDeclaration ],
                    }
                    this.renameBinding(referencesWithoutDeclaration, localIdentifier);
                    geoStatements.push(declarationStmtNode);
                } else {
                    throw new Error(`Cannot find linking rule type "${(linkingRule as any).type}"`);
                }
            }

            // remaining bindings
            for (const [ bindingIdentifier, binding ] of Object.entries(templateScope.bindings)){
                let replacementIdentifier = bindingIdentifier;
                const outputRegex = new RegExp(`^${this.outputPrefix}.+`);
                const isNotOutput = bindingIdentifier.match(outputRegex) == null;
                if (isNotOutput) {
                    replacementIdentifier = this.getLocalIdentifier(nodeIndex, bindingIdentifier);
                }
                this.renameBinding(binding.references, replacementIdentifier);

                if (geoScope.bindings[replacementIdentifier]) {
                    throw new Error(`Identifier binding already declared "${replacementIdentifier}"`);
                }
                geoScope.bindings[replacementIdentifier] = binding;
            }
            // add statements
            geoStatements.push(...templateFunctionNode.body.statements);
            const descendantScopes = this.getDescendandScopes(templateScope, templateProgram.scopes);
            geoProgram.scopes.push(...descendantScopes);
        }

        return geoProgram;
    }

    private getDescendandScopes(targetScope: Scope, scopes: Scope[]) {
        const descendants = new Set<Scope>();
        for (const scope of scopes) {
            for (let s = scope; s != null; s = s.parent!) {
                if (s.parent === targetScope || descendants.has(s.parent!)) {
                    descendants.add(scope);
                    break;
                }
            }
        }
        return [ ...descendants ];
    }

    private renameBinding(references: AstNode[], targetIdentifier: string) {
        for (const reference of references) {
            switch (reference.type) {
                case 'identifier':
                    reference.identifier = targetIdentifier;
                    break;
                case 'declaration':
                    reference.identifier.identifier = targetIdentifier;
                    break;
                default:
                    throw new Error(`Unknown bound ast node with type "${reference.type}"`);
            }
        }
    }

    private replaceReturnWithDeclaration(program: Program, identifier: string) {
        const fnNode = program.program[0] as FunctionNode;
        let returnStmtPath: Path<ReturnStatementNode> | undefined;
        visit(fnNode.body, { return_statement: { enter: path => returnStmtPath = path }});
        if (!returnStmtPath) {
            throw new Error(`Couldn't find return statement`);
        }
        const stmtIndex = returnStmtPath.index!;
        if (fnNode.body.statements[stmtIndex] !== returnStmtPath.node) {
            throw new Error(`Return stmt must be directly inside function body`);
        }
        const outputFullSpecType = fnNode.prototype.header.returnType;
        const declarationNode = AstUtils.createDeclaration(identifier, returnStmtPath.node.expression);
        // replace stmt
        const declarationStmtNode = AstUtils.createDeclarationStatement(outputFullSpecType, declarationNode);
        fnNode.body.statements[stmtIndex] = declarationStmtNode;
        // declare binding
        const functionScope = program.scopes.find(scope => scope.name === fnNode.prototype.header.name.identifier)!;
        if (functionScope.bindings[identifier]) {
            throw new Error(`Variable "${identifier}" was already declared`);
        }
        functionScope.bindings[identifier] = {
            references: [ declarationNode ],
        }
    }

    private getConstIdentifier(to: ToCoordinate) {
        return `_const_${to.nodeIndex}_${to.rowId}`;
    }

    private getLocalIdentifier(nodeIndex: number, localIdentifier: string) {
        return `_local_${nodeIndex}_${localIdentifier}`;
    }

    private outputPrefix = '_out_';
    private getNodeOutputIdentifier(nodeIndex: number) {
        return `${this.outputPrefix}${nodeIndex}`;
    }

    private getGeometryMethodName(geometryId: string) {
        return `_geo_${geometryId}`;
    }

    private getReturnLambdaArgumentIdentifier(argIndex: number) {
        return `_out_lambda_arg_${argIndex}`;
    }

    private getRowLinkingRule(
        geometry: GeometryS,
        connectionData: GeometryConnectionData,
        nodeState: GNodeState, 
        nodeTemplate: GNodeTemplate,
        nodeIndex: number,
        rowId: string,
    ): LinkingRule {
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
        const incomingEdges = connectionData.backwardEdges[nodeIndex]?.[rowIndex] || []

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
        //         const identifier = getIdentifierName(Prefixes.Edge, ...jointEdge.fromIndices);
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
            return { 
                type: 'edge',
                from: { nodeIndex: fromNodeIndex },
                to: { nodeIndex, rowId }, 
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
        //         const dynamicId = getIdentifierName(Prefixes.Dynamic, nodeIndex, rowIndex);
        //         path.node.identifier = dynamicId;
        //         if (!definedLocals.has(dynamicId)) {
        //             definedLocals.add(dynamicId);
        //             // DECLARATION
        //             const size = textureVarDatatypeSize[rowTemp.dataType];
        //             if (size <= 0) {
        //                 throw new Error(`cannot lookup dataType ${rowTemp.dataType}`);
        //             }
        //             const textureCoordinate = textureCoordinateCounter.nextInts(size);
        //             const textureLookupCode = formatTextureLookupStatement(dynamicId, textureCoordinate, rowTemp.dataType);
        //             addDeclarationInfront(path, textureLookupCode);
        //             // VAR MAPPING
        //             textureVarMappings.push({
        //                 dataType: rowTemp.dataType,
        //                 textureCoordinate,
        //                 geometryId: geometry.id,
        //                 geometryVersion: geometry.version,
        //                 nodeIndex: nodeIndex,
        //                 rowIndex,
        //             });
        //         }
        //         return;
        //     }

        // case 4: fixed constant
        const value = (rowState as RowS<BaseInputRowT>)?.value ?? rowTemp.value;
        const expression = parseValue(rowTemp.dataType, value);
        return {
            type: 'expression',
            to: { nodeIndex, rowId },
            expression,
        }
    }

    private getTemplateProgramInstance(template: GNodeTemplate) {
        /**
         * TODO
         * - memoize result
         */
        const program = parseMarbleLanguage(template.instructions);

        const globalSymbolCount = Object.keys(program.scopes[0].bindings).length;
        if (globalSymbolCount !== 0) {
            throw new Error(`Template instructions must only contain a single method`);
        }
        const func = program.program[0] as FunctionNode;
        const inputParams = AstUtils.getParameterIdentifiers(func.prototype.parameters);
        for (const [ typeNode, paramIdentifier ] of inputParams) {
            if (!template.rows.find(row => row.id === paramIdentifier)) {
                throw new Error(`Function parameter "${paramIdentifier}" is not a row on template.`);
            }
        }
        return _.cloneDeep(program);
    }
}

type ToCoordinate = { nodeIndex: number, rowId: string };

interface EdgeLinkingRule {
    type: 'edge';
    from: { nodeIndex: number };
    to: ToCoordinate;
}
interface ExpressionLinkingRule {
    type: 'expression';
    to: ToCoordinate;
    expression: any;
}
type LinkingRule = EdgeLinkingRule | ExpressionLinkingRule;

