import { ExpressionNode, FunctionCallNode, FunctionNode, IdentifierNode, LambdaExpressionNode, LambdaTypeSpecifierNode, parse as parseMarbleLanguage, ReturnStatementNode, Scope, StatementNode, SymbolNode, SymbolRow } from '@marble/language';
import { generate as generateGlslCode } from '@shaderfrog/glsl-parser';
import { visit } from '@shaderfrog/glsl-parser/ast/ast';
import _ from 'lodash';
import { mapDynamicValues } from '.';
import { DataTypes, DependencyGraph, GeometryConnectionData, GeometryS, getDependencyKey, GNodeTemplate, Layer, LayerProgram, ObjMapUndef, ProgramInclude, ProgramTextureVarMapping, splitDependencyKey } from "../../types";
import { Counter } from '../Counter';
import topSortDependencies from '../dependencyGraph/topSortDependencies';
import { LOOKUP_TEXTURE_WIDTH } from '../viewportView/GLProgramRenderer';
import ast from './AstUtils';
import { generateTextureLookupStatement, parseDataType } from './generateCodeStatements';
import { GeometryContext } from './GeometryContext';
import ProgramBuilder from './ProgramBuilder';

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

        const geometryFunctions = new Array<FunctionNode>();
        const textureCoordinateCounter = new Counter(LOOKUP_TEXTURE_WIDTH, textureVarRowIndex * LOOKUP_TEXTURE_WIDTH);
        const textureVarMappings = new Array<ProgramTextureVarMapping>();

        for (const geoId of topologicalGeometrySorting) {
            const geoOrderEl = dependencyGraph.order.get(getDependencyKey(geoId, 'geometry'))!;
            const geo = geometries[geoId];
            const data = geometryDatas[geoId];
            if (!geo || !data || geo.version != geoOrderEl.version || geo.version != data.geometryVersion) {
                return null;
            }

            const context = new GeometryContext(geo, data);
            const geoProgramBuilder = this.functionNodeFromGeometry(
                context, textureCoordinateCounter, textureVarMappings
            );
            if (!geoProgramBuilder) {
                continue;
            }
            this.refactorLambdas(geoProgramBuilder);
            const geoFunction = geoProgramBuilder.program.program[0] as FunctionNode;
            geometryFunctions.push(geoFunction);
        }

        const generatedCode = generateGlslCode({
            type: 'program',
            // @ts-ignore
            program: geometryFunctions,
            scopes: [],
        });
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
        const rootFunctionName = GeometryContext.getIdentifierName('geometry', rootGeometryId);

        const textureVarRow = mapDynamicValues(textureVarMappings, geometries, geometryDatas);

        return {
            id: layer.id,
            index: layer.index,
            name: layer.name,
            hash: layerHash,
            mainProgramCode: generatedCode,
            includes: [], //usedIncludesArr,
            rootFunctionName,
            textureVarMappings,
            textureVarRowIndex,
            textureVarRow,
        }
    }

    private refactorLambdas(builder: ProgramBuilder) {
        const func = builder.program.program[0] as FunctionNode;
        const funcScope = builder.getFunctionScope(func);

        // TODO: params of geometry function

        const returnType = func.prototype.header.returnType.specifier;
        if (returnType.type === 'lambda_type_specifier') {
            this.refactorLambdaReturn(builder, func, funcScope, returnType);
        }
        
        const declaredLambdas = new Map<string, LambdaDeclaration>();
        let lambdaCounter = 0;

        let nextStatement = func.body.statements[0];
        while (nextStatement) {
            const statement = nextStatement;
            const statementIndex = func.body.statements.indexOf(statement);
            nextStatement = func.body.statements[statementIndex + 1];

            // check if lambda definition
            if (statement.type === 'declaration_statement' &&
                statement.declaration.specified_type.specifier.type === 'lambda_type_specifier') {
                const lambdaExpression = statement.declaration.declarations[0].initializer as LambdaExpressionNode;
                if (lambdaExpression.type !== 'lambda_expression') {
                    throw new Error(`Lambda declaration was not initialized by lambda expression`);
                }
                const declarationIdentifier = statement.declaration.declarations[0].identifier.identifier;
                const lambdaScope = builder.findScopeByName(lambdaExpression.header.name);
                declaredLambdas.set(declarationIdentifier, {
                    lambdaExpression, 
                    lambdaScope,
                    lambdaType: statement.declaration.specified_type.specifier,
                });
                // remove stmt
                builder.spliceFunctionStatement(func, statement);
                continue;
            }
        
            // check for lambda reference
            visit(statement, {
                function_call: {
                    exit: path => {
                        const call = path.node as FunctionCallNode;
                        const callIdentifier = call.identifier as any;
                        const identifier: string | undefined = 
                            callIdentifier.specifier?.identifier || 
                            callIdentifier.identifier || 
                            callIdentifier.keyword;
                        const lambdaTemplate = declaredLambdas.get(identifier!);
                        if (!lambdaTemplate) { return; }
                        this.instantiateLambda(
                            builder, func, call, lambdaTemplate, statement, lambdaCounter++
                        );
                    }
                }
            });
        }

        return builder;
    }

    private refactorLambdaReturn(builder: ProgramBuilder, func: FunctionNode, funcScope: Scope, returnType: LambdaTypeSpecifierNode) {
        const callArgs: string[] = [];
        // add lambda args to function prototype
        for (let argIndex = 0; argIndex < returnType.args.length; argIndex++) {
            const arg = GeometryContext.getIdentifierName('lambda_arg', argIndex);
            callArgs.push(arg);
            const paramDeclaration = ast.createParameterDeclaration(
                returnType.args[argIndex], 
                ast.createIdentifier(arg)
            );
            builder.addFunctionParameter(func, paramDeclaration, arg);
        }
        // change function return type
        returnType.return_type.specifier.whitespace = ' ';
        func.prototype.header.returnType.specifier = returnType.return_type;

        // find lambda return statement
        const returnStatement = func.body.statements
            .find(s => s.type === 'return_statement') as ReturnStatementNode | undefined;
        if (!returnStatement) {
            throw new Error(`A return statement must be placed in the main function scope`);
        }

        // sandwich function call
        const argIdentifiers = callArgs.map(arg => {
            const idNode = ast.createIdentifier(arg);
            builder.addNodeReference(funcScope, idNode);
            return idNode;
        })
        const functionCallNode = ast.createFunctionCall(
            returnStatement.expression,
            argIdentifiers,
        );
        returnStatement.expression = functionCallNode;
    }

    private instantiateLambda(
        builder: ProgramBuilder, 
        func: FunctionNode, 
        call: FunctionCallNode, 
        lambdaDeclaration: LambdaDeclaration, 
        statement: StatementNode,
        instanceIndex: number
    ) {
        const lambdaInstance = _.cloneDeep(lambdaDeclaration);
        const { lambdaExpression, lambdaScope, lambdaType } = lambdaInstance;
        
        // declare arguments
        const argumentExpressions = call.args
            .filter(arg => arg.type !== 'literal') as ExpressionNode[]; // filter commas
        const paramList = ast.getParameterIdentifiers(lambdaExpression.header.parameters);
        if (argumentExpressions.length !== paramList.length) {
            throw new Error(`Wrong amount of arguments for lambda`);
        }
        for (let paramIndex = 0; paramIndex < paramList.length; paramIndex++) {
            // declaration statement
            const [ typeSpec, paramIdentifier ] = paramList[paramIndex];
            if (!paramIdentifier) {
                throw new Error(`Lambda parameters must be named`);
            }
            const argIdentifier = `_lambda_${instanceIndex}_arg_${paramIndex}`;
            const declaration = ast.createDeclaration(
                argIdentifier, 
                argumentExpressions[paramIndex]
            );
            const declarationStatement = ast.createDeclarationStatement(
                ast.createFullySpecifiedType(typeSpec), 
                declaration
            );
            const binding: SymbolRow<SymbolNode> = { initializer: declaration, references: [ declaration ] };
            builder.addFunctionStatement(func, declarationStatement, statement, {
                [argIdentifier]: binding,
            });
            // rename 
            if (lambdaScope) {
                const referencesOnly = lambdaScope.bindings[paramIdentifier]!.references
                    .filter(reference => reference.type !== 'parameter_declaration');
                builder.mergeAndRenameReferences(binding, referencesOnly);
            }
        }
        // declare lambda output value
        const outIdentifier = `lambda_${instanceIndex}_out`;
        const outDeclaration = ast.createDeclaration(outIdentifier, lambdaExpression.body);
        const outDeclarationStatement = ast.createDeclarationStatement(
            ast.createFullySpecifiedType(
                lambdaType.return_type
            ), 
            outDeclaration,
        );
        const outBinding: SymbolRow<SymbolNode> = { initializer: outDeclaration, references: [ outDeclaration ] };
        builder.addFunctionStatement(func, outDeclarationStatement, statement, {
            [ outIdentifier ]: outBinding,
        });
        // make call into identifier
        builder.removeReferencesOfSubtree(call.identifier); // cleanup
        const outIdentifierNode = call as unknown as IdentifierNode;
        Object.assign(outIdentifierNode, ast.createIdentifier(outIdentifier));
        outBinding.references.push(outIdentifierNode);
    }

    private functionNodeFromGeometry(
        geoCtx: GeometryContext,
        textureCoordinateCounter: Counter, 
        textureVarMappings: ProgramTextureVarMapping[],
    ): ProgramBuilder | null {
        const usedSortedNodeGenerator = geoCtx.sortUsedNodeIndices();
        if (!usedSortedNodeGenerator.length) {
            return null;
        }
        
        const methodName = GeometryContext.getIdentifierName('geometry', geoCtx.geometry.id);
        const [ outputRow ] = geoCtx.geometry.outputs;
        const returnType = parseDataType(outputRow.dataType);
        const geoBuilder = new ProgramBuilder();
        const {
            functionNode: geoFunction,
            functionScope: geoFunctionScope,
        } = geoBuilder.createFunction(returnType, methodName);

        for (const nodeIndex of usedSortedNodeGenerator) {
            geoCtx.select(nodeIndex);
            const isOutput = nodeIndex === usedSortedNodeGenerator.at(-1);
            // create template builder
            const templateProgramInstance = this.getTemplateProgramInstance(geoCtx.activeNodeData.template);
            const templateBuilder = new ProgramBuilder(templateProgramInstance);
            const templateFunction = templateBuilder.program.program[0] as FunctionNode;
            const templateFunctionScope = templateBuilder.getFunctionScope(templateFunction);

            const processedBindings = new Set<SymbolRow<SymbolNode>>();
            let outputBinding: SymbolRow<SymbolNode> | undefined;

            // return statement to declaration
            const returnStatement = templateFunction.body.statements
                .find(statement => statement.type === 'return_statement') as ReturnStatementNode | undefined;
            if (!isOutput && returnStatement) {
                templateBuilder.spliceFunctionStatement(templateFunction, returnStatement);
                const nodeOutputIdentifier = GeometryContext.getIdentifierName('output', nodeIndex);
                const outputFullSpecType = templateFunction.prototype.header.returnType;
                const declaration = ast.createDeclaration(
                    nodeOutputIdentifier, 
                    returnStatement.expression,
                );
                const declarationStatement = ast.createDeclarationStatement(outputFullSpecType, declaration);
                outputBinding = { initializer: declaration, references: [ declaration ] };
                templateBuilder.addFunctionStatement(templateFunction, declarationStatement, undefined, {
                    [nodeOutputIdentifier]: outputBinding,
                });
            }

            const paramDeclarations = ast.getParameterIdentifiers(templateFunction.prototype.parameters);
            for (const [ paramTypeSpecNode, paramIdentifier ] of paramDeclarations) {
                if (!paramIdentifier) {
                    throw new Error(`No unnamed params allowed`);
                }
                const paramSymbolRow = templateBuilder.findSymbolOfScopeBranch(templateFunctionScope, paramIdentifier);
                if (!paramSymbolRow) {
                    throw new Error(`Could not find symbol for parameter`);
                }
                processedBindings.add(paramSymbolRow);
                const referencesWithoutDeclaration = paramSymbolRow.references
                    .filter(astNode => astNode.type !== 'parameter_declaration');
        
                const linkingRule = geoCtx.getRowLinkingRule(paramIdentifier);

                if (linkingRule.type === 'edge') {
                    const { identifier } = linkingRule;
                    const targetBinding = geoBuilder.findSymbolOfScopeBranch(geoFunctionScope, identifier);
                    if (!targetBinding) {
                        throw new Error(`Undeclared binding for identifier "${identifier}"`);
                    }
                    geoBuilder.mergeAndRenameReferences(targetBinding, referencesWithoutDeclaration);
                    
                } else if (linkingRule.type === 'expression') {
                    const { expression, identifier } = linkingRule;
                    templateBuilder.renameReferences(referencesWithoutDeclaration, identifier);
                    const declaration = ast.createDeclaration(identifier, expression);
                    const declarationStatement = ast.createDeclarationStatement(
                        ast.createFullySpecifiedType(paramTypeSpecNode),
                        declaration,
                    );
                    const binding = { initializer: declaration, references: [ declaration, ...referencesWithoutDeclaration ]};
                    geoBuilder.addFunctionStatement(geoFunction, declarationStatement, undefined, { 
                        [identifier]: binding,
                    });
        
                } else if (linkingRule.type === 'lookup') {
                    const { identifier, dataSize, rowDataType, rowIndex } = linkingRule;
                    let binding = geoBuilder.findSymbolOfScopeBranch(geoFunctionScope, identifier);
                    if (!binding) {
                        const textureCoordinate = textureCoordinateCounter.nextInts(dataSize);
                        const [ declaration, declarationStatement ] = generateTextureLookupStatement(
                            identifier, textureCoordinate, rowDataType);
                        binding = { initializer: declaration, references: [ declaration ] };
                        geoBuilder.addFunctionStatement(geoFunction, declarationStatement, undefined, {
                            [identifier]: binding,
                        })
                        textureVarMappings.push({
                            dataType: rowDataType,
                            textureCoordinate,
                            geometryId: geoCtx.geometry.id,
                            geometryVersion: geoCtx.geometry.version,
                            nodeIndex: nodeIndex,
                            rowIndex,
                        });
                    }
                    geoBuilder.mergeAndRenameReferences(binding, referencesWithoutDeclaration);
        
                } else {
                    throw new Error(`Cannot find linking rule type "${(linkingRule as any).type}"`);
                }
            }

            // remaining bindings
            for (const [ bindingIdentifier, binding ] of Object.entries(templateFunctionScope.bindings)){
                if (processedBindings.has(binding)) {
                    continue;
                }
                if (binding !== outputBinding) {
                    const replacementIdentifier = GeometryContext.getIdentifierName('local', nodeIndex, bindingIdentifier);
                    templateBuilder.renameReferences(binding.references, replacementIdentifier);
                }
                geoBuilder.declareBinding(geoFunctionScope.bindings, binding);
            }
            // add statements
            geoFunction.body.statements.push(...templateFunction.body.statements);
            const descendantScopes = templateBuilder.getDescendandScopes(templateFunctionScope);
            geoBuilder.program.scopes.push(...descendantScopes);
        }
        return geoBuilder;
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
        const inputParams = ast.getParameterIdentifiers(func.prototype.parameters);
        for (const [ typeNode, paramIdentifier ] of inputParams) {
            if (!template.rows.find(row => row.id === paramIdentifier)) {
                throw new Error(`Function parameter "${paramIdentifier}" is not a row on template.`);
            }
        }
        return _.cloneDeep(program);
    }
}

interface LambdaDeclaration {
    lambdaType: LambdaTypeSpecifierNode;
    lambdaExpression: LambdaExpressionNode;
    lambdaScope?: Scope;
}

interface EdgeLinkingRule {
    type: 'edge';
    identifier: string;
}
interface ExpressionLinkingRule {
    type: 'expression';
    identifier: string;
    expression: ExpressionNode;
}
interface LookupLinkingRule {
    type: 'lookup';
    identifier: string;
    dataSize: number;
    rowDataType: DataTypes;
    rowIndex: number;
}
export type LinkingRule = EdgeLinkingRule | ExpressionLinkingRule | LookupLinkingRule;
