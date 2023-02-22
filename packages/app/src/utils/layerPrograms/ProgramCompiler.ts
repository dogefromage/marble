import { AstNode, CompoundStatementNode, DeclaratorListNode, ExpressionNode, FullySpecifiedTypeNode, FunctionCallNode, FunctionNode, IdentifierNode, LambdaExpressionNode, LambdaTypeSpecifierNode, parse as parseMarbleLanguage, PreprocessorNode, Program, ReturnStatementNode, Scope, StatementNode, SymbolNode, SymbolRow } from '@marble/language';
import { generate as generateGlslCode } from '@shaderfrog/glsl-parser';
import { visit } from '@shaderfrog/glsl-parser/ast/ast';
import _ from 'lodash';
import objectPath from 'object-path';
import { mapDynamicValues } from '.';
import { DependencyGraph, GeometryConnectionData, GeometryS, getDependencyKey, GNodeTemplate, Layer, LayerProgram, ObjMap, ObjMapUndef, ProgramInclude, ProgramTextureVarMapping, splitDependencyKey } from "../../types";
import { Counter } from '../Counter';
import topSortDependencies from '../dependencyGraph/topSortDependencies';
import { LOOKUP_TEXTURE_WIDTH } from '../viewportView/GLProgramRenderer';
import ast from './AstUtils';
import { generateTextureLookupStatement, parseDataType } from './generateCodeStatements';
import { GeometryContext } from './GeometryContext';
import builder from './ProgramBuilder';

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
        const usedIncludes = new Set<string>();

        for (const geoId of topologicalGeometrySorting) {
            const geoOrderEl = dependencyGraph.order.get(getDependencyKey(geoId, 'geometry'))!;
            const geo = geometries[geoId];
            const data = geometryDatas[geoId];
            if (!geo || !data || geo.version != geoOrderEl.version || geo.version != data.geometryVersion) {
                return null;
            }

            const context = new GeometryContext(geo, data);
            const geoProgram = this.functionNodeFromGeometry(
                context, textureCoordinateCounter, textureVarMappings, usedIncludes);
            if (!geoProgram) {
                continue;
            }

            this.refactorLambdas(geoProgram);
            this.removeIdentityDeclarations(geoProgram);
            const geoFunction = builder.findFirstFunction(geoProgram);
            ast.correctIndent(geoFunction.body, 4);
            geometryFunctions.push(geoFunction);
        }

        const generatedCode = generateGlslCode({
            type: 'program',
            // @ts-ignore
            program: geometryFunctions,
            scopes: [],
        });
        console.info(generatedCode);

        const programIncludeArray = new Array<ProgramInclude>();
        for (const includeIdentfier of usedIncludes) {
            const programInclude = includes[includeIdentfier];
            if (!programInclude) {
                throw new Error(`Include "${includeIdentfier}" is missing!`);
            }
            programIncludeArray.push(programInclude);
        }

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
            includes: programIncludeArray,
            rootFunctionName,
            textureVarMappings,
            textureVarRowIndex,
            textureVarRow,
        }
    }

    private removeIdentityDeclarations(program: Program) {
        // @ts-ignore
        visit(program, {
            compound_statement: {
                exit: path => {
                    const statements = path.node.statements as StatementNode[];
                    for (let i = statements.length - 1; i >= 0; i--) {
                        const statement = statements[i];
                        if (statement.type !== 'declaration_statement') continue;
                        const declaratorList = statement.declaration as DeclaratorListNode;
                        if (declaratorList.type !== 'declarator_list') continue;;
                        if (declaratorList.declarations.length > 1) continue;;
                        const [ declaration ] = declaratorList.declarations;
                        if (declaration.initializer.type !== 'identifier') continue;;
                        // we know now the declaration is an identity declaration
                        const refIdentifier = declaration.initializer;
                        const refBinding = builder.findReferenceSymbolRow(program, refIdentifier)!;
                        const declarationBinding = builder.findReferenceSymbolRow(program, declaration)!;
                        const referencesWithoutInitializer = declarationBinding.references
                            .filter(ref => ref !== declarationBinding.initializer);
                        builder.mergeAndRenameReferences(refBinding, referencesWithoutInitializer);
                        statements.splice(i, 1);
                        builder.removeReferencesOfSubtree(program, statement);
                    }
                }
            }
        })
    }

    private refactorLambdas(program: Program) {
        const func = builder.findFirstFunction(program);
        const funcScope = builder.getFunctionScope(program, func);

        // TODO: params of geometry function

        const returnType = func.prototype.header.returnType.specifier;
        if (returnType.type === 'lambda_type_specifier') {
            this.refactorLambdaReturn(func, funcScope, returnType);
        }

        const declaredLambdas = new Map<string, LambdaDeclaration>();
        const lambdaCounter = new Counter(1e10, 0);

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
                // scope
                let lambdaScope = program.scopes
                    .find(scope => scope.name === lambdaExpression.header.name);
                if (!lambdaScope) {
                    const dummyNode = ast.createIdentifier('dummy');
                    lambdaScope = {
                        name: lambdaExpression.header.name,
                        bindings: {},
                        functions: {},
                        types: {},
                        parent: funcScope,
                    }
                    const params = ast.getParameterIdentifiers(lambdaExpression.header.parameters);
                    for (const [_, param] of params) {
                        lambdaScope.bindings[param] = { initializer: dummyNode, references: [] };
                    }
                }

                const declarationIdentifier = statement.declaration.declarations[0].identifier.identifier;
                declaredLambdas.set(declarationIdentifier, {
                    lambdaExpression,
                    lambdaScope,
                    lambdaType: statement.declaration.specified_type.specifier,
                });
                // remove stmt
                builder.spliceStatement(func.body, statement);
                continue;
            }

            const invocations = this.findLambdaInvocations(statement, declaredLambdas);

            for (const invocation of invocations) {
                const identifier = builder.getFunctionCallIdentifier(invocation)!;
                const declaration = declaredLambdas.get(identifier)!;
                this.instantiateLambda(
                    program, func, funcScope, invocation, declaration, statement, lambdaCounter, declaredLambdas,
                );
            }
        }

        return builder;
    }

    private findLambdaInvocations(astNode: AstNode, declaredLambdas: Map<string, LambdaDeclaration>) {
        const invocations = new Array<FunctionCallNode>();
        // @ts-ignore
        visit(astNode, {
            function_call: {
                exit: path => {
                    const call = path.node as FunctionCallNode;
                    const identifier = builder.getFunctionCallIdentifier(call)!;
                    const declaration = declaredLambdas.get(identifier)
                    if (declaration) {
                        invocations.push(call);
                    }
                }
            }
        });
        return invocations;
    }

    private refactorLambdaReturn(func: FunctionNode, funcScope: Scope, returnType: LambdaTypeSpecifierNode) {
        const callArgs: string[] = [];
        // add lambda args to function prototype
        for (let argIndex = 0; argIndex < returnType.args.length; argIndex++) {
            const arg = GeometryContext.getIdentifierName('lambda_arg', argIndex);
            callArgs.push(arg);
            const paramDeclaration = ast.createParameterDeclaration(
                returnType.args[argIndex],
                ast.createIdentifier(arg)
            );
            builder.addFunctionParameter(func, funcScope, paramDeclaration);
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
        program: Program,
        func: FunctionNode,
        funcScope: Scope,
        call: FunctionCallNode,
        lambdaDeclaration: LambdaDeclaration,
        beforeStatement: StatementNode,
        instanceCounter: Counter,
        declaredLambdas: Map<string, LambdaDeclaration>,
    ) {
        const instanceIndex = instanceCounter.increment();

        // declare arguments
        const argumentExpressions = call.args
            .filter(arg => arg.type !== 'literal') as ExpressionNode[]; // filter commas
        const paramList = ast.getParameterIdentifiers(lambdaDeclaration.lambdaExpression.header.parameters);
        if (argumentExpressions.length !== paramList.length) {
            throw new Error(`Wrong amount of arguments for lambda`);
        }
        const paramMapping: ParamMapping = {};

        for (let paramIndex = 0; paramIndex < paramList.length; paramIndex++) {
            // declaration statement
            const [typeSpec, paramIdentifier] = paramList[paramIndex];
            if (!paramIdentifier) {
                throw new Error(`Lambda parameters must be named`);
            }
            const replacementIdentifier = `lambda_${instanceIndex}_arg_${paramIndex}`;
            const declaration = ast.createDeclaration(
                replacementIdentifier,
                argumentExpressions[paramIndex]
            );
            const declarationStatement = ast.createDeclarationStatement(
                ast.createFullySpecifiedType(typeSpec),
                declaration
            );
            const binding: SymbolRow<SymbolNode> = { initializer: declaration, references: [declaration] };
            builder.addStatementToCompound(func.body, funcScope, declarationStatement, beforeStatement, {
                [replacementIdentifier]: binding,
            });
            paramMapping[paramIdentifier] = { replacementIdentifier };
        }

        const lambdaBody = lambdaDeclaration.lambdaExpression.body;
        const lambdaScope = lambdaDeclaration.lambdaScope;

        const outIdentifier = `lambda_${instanceIndex}_out`;
        const lambdaOutput = {
            identifier: outIdentifier,
            specifier: ast.createFullySpecifiedType(
                lambdaDeclaration.lambdaType.return_type,
            )
        }

        const newStatements = this.appendFunctionBody(
            program, func.body, funcScope,
            program, lambdaBody, lambdaScope,
            paramMapping,
            `l${instanceIndex}`,
            lambdaOutput,
            beforeStatement,
        );
        // make call into identifier of lambda value
        builder.removeReferencesOfSubtree(program, call.identifier);
        const lambdaResultRef = call as unknown as IdentifierNode;
        Object.assign(lambdaResultRef, ast.createIdentifier(outIdentifier));
        builder.addNodeReference(funcScope, lambdaResultRef);

        // recurse lambda invocation routine
        for (const newStatement of newStatements) {
            const subInvocations = this.findLambdaInvocations(newStatement, declaredLambdas);
            for (const subInvocation of subInvocations) {

                const identifier = builder.getFunctionCallIdentifier(subInvocation)!;
                const declaration = declaredLambdas.get(identifier)!;
                this.instantiateLambda(
                    program, func, funcScope, subInvocation, declaration, newStatement, instanceCounter, declaredLambdas,
                );
            }
        }
    }

    private functionNodeFromGeometry(
        geoCtx: GeometryContext,
        textureCoordinateCounter: Counter,
        textureVarMappings: ProgramTextureVarMapping[],
        usedIncludes: Set<string>,
    ): Program | null {
        const usedSortedNodeGenerator = geoCtx.sortUsedNodeIndices();
        if (!usedSortedNodeGenerator.length) {
            return null;
        }

        const geoProgram = builder.createEmptyProgram();
        const methodName = GeometryContext.getIdentifierName('geometry', geoCtx.geometry.id);
        const [ outputRow ] = geoCtx.geometry.outputs;
        const returnType = parseDataType(outputRow.dataType);
        const {
            functionNode: geoFunction,
            functionScope: geoScope,
        } = builder.createFunction(geoProgram, returnType, methodName);

        for (const input of geoCtx.geometry.inputs) {
            const inputParam = (
                ast.createParameterDeclaration(
                    parseDataType(input.dataType),
                    ast.createIdentifier(input.id),
                )   
            ); 
            builder.addFunctionParameter(geoFunction, geoScope, inputParam);
        }

        for (const nodeIndex of usedSortedNodeGenerator) {
            geoCtx.select(nodeIndex);
            const isOutput = nodeIndex === usedSortedNodeGenerator.at(-1);
            // create template builder
            const templateProgram = this.getTemplateProgramInstance(geoCtx.activeNodeData.template);
            const templateFunction = builder.findFirstFunction(templateProgram);
            const templateFunctionScope = templateProgram.scopes
                .find(scope => scope.name === templateFunction.prototype.header.name.identifier);
            if (!templateFunctionScope) {
                throw new Error(`Couldn't find scope`);
            }
            // includes
            this.processIncludes(templateProgram, usedIncludes);
            // params
            const paramMapping: ParamMapping = {};
            const paramDeclarations = ast.getParameterIdentifiers(templateFunction.prototype.parameters);
            for (const [specifier, parameter] of paramDeclarations) {
                const linkingRule = geoCtx.getRowLinkingRule(parameter);

                let replacementIdentifier: string;

                if (linkingRule.type === 'edge') {
                    replacementIdentifier = linkingRule.identifier;

                } else if (linkingRule.type === 'expression') {
                    const { expression, identifier } = linkingRule;
                    const declaration = ast.createDeclaration(identifier, expression);
                    const declarationStatement = ast.createDeclarationStatement(
                        ast.createFullySpecifiedType(specifier),
                        declaration,
                    );
                    const binding = { initializer: declaration, references: [declaration] };
                    builder.addStatementToCompound(
                        geoFunction.body, geoScope, declarationStatement,
                        undefined, { [identifier]: binding }
                    );
                    replacementIdentifier = identifier;

                } else if (linkingRule.type === 'lookup') {
                    const { identifier, dataSize, rowDataType, rowIndex } = linkingRule;
                    let binding = builder.findSymbolOfScopeBranch(geoScope, identifier);
                    if (!binding) {
                        const textureCoordinate = textureCoordinateCounter.nextInts(dataSize);
                        const [declaration, declarationStatement] = generateTextureLookupStatement(
                            identifier, textureCoordinate, rowDataType);
                        binding = { initializer: declaration, references: [declaration] };
                        builder.addStatementToCompound(
                            geoFunction.body, geoScope, declarationStatement,
                            undefined, { [identifier]: binding }
                        );
                        textureVarMappings.push({
                            dataType: rowDataType,
                            textureCoordinate,
                            geometryId: geoCtx.geometry.id,
                            geometryVersion: geoCtx.geometry.version,
                            nodeIndex: nodeIndex,
                            rowIndex,
                        });
                    }
                    replacementIdentifier = identifier;

                } else if (linkingRule.type === 'parameter') {
                    const { parameter } = linkingRule;
                    replacementIdentifier = parameter;
                } else {
                    throw new Error(`Cannot find linking rule type "${(linkingRule as any).type}"`);
                }

                paramMapping[parameter] = { replacementIdentifier };
            }

            // output of node
            const nodeOutputIdentifier = GeometryContext.getIdentifierName('output', nodeIndex);
            const outputFullSpec = templateFunction.prototype.header.returnType;
            const output = isOutput ? undefined : {
                identifier: nodeOutputIdentifier,
                specifier: outputFullSpec,
            };

            const templateCopy = _.cloneDeep({
                prog: templateProgram,
                body: templateFunction.body,
                scope: templateFunctionScope,
            });

            this.appendFunctionBody(
                geoProgram,
                geoFunction.body,
                geoScope,
                templateCopy.prog,
                templateCopy.body,
                templateCopy.scope,
                paramMapping,
                nodeIndex,
                output,
            );
        }
        return geoProgram;
    }

    private processIncludes(program: Program, usedIncludes: Set<string>) {
        const preprocessors = program.program.filter(node => node.type === 'preprocessor') as PreprocessorNode[];
        for (const preprocessor of preprocessors) {
            const { line } = preprocessor;
            const matchIncludes = line.match(/#\s*include\s+(\w+(?:\s*,\s*\w+)*)\s*;/i);
            if (matchIncludes != null) {
                const includesRaw = matchIncludes[ 1 ]!;
                const includes = includesRaw.split(',').map(s => s.trim());
                for (const include of includes) {
                    usedIncludes.add(include);
                }
            }
        }
    }

    private appendFunctionBody(
        targetProg: Program,
        targetBody: CompoundStatementNode,
        targetScope: Scope,
        refProg: Program,
        refBody: CompoundStatementNode | ExpressionNode,
        refScope: Scope,
        paramMapping: ParamMapping,
        localName: string | number,
        output?: {
            specifier: FullySpecifiedTypeNode,
            identifier: string,
        },
        beforeStatement?: StatementNode,
    ) {
        type ExternalPair = [ (string|number)[], SymbolRow<SymbolNode> ];
        const externalReferences = new Array<ExternalPair>();

        builder.visitSymbolNodes(
            refProg, refBody, 
            (path, binding, scope) => {
                if (builder.isDescendantScope(scope, refScope)) {
                    const pathToNode = new Array<string|number>();
                    while (path.parentPath) {
                        if (path.index != null) pathToNode.unshift(path.index);
                        if (path.key   != null) pathToNode.unshift(path.key);
                        path = path.parentPath!;
                    }
                    externalReferences.push([ pathToNode, binding ]);
                }
            }
        );

        // object must be combined to maintain circular references
        const refTriple = [ refProg, refBody, refScope ] as const;
        const [ instanceProg, instanceBody, instanceScope ] = 
            _.cloneDeep(refTriple);

        // reference externals in copied body
        for (const [ path, externalBinding ] of externalReferences) {
            const ref = objectPath.get(instanceBody, path);
            if (!builder.isSymbolNode(ref)) {
                throw new Error(`Not symbol`);
            }
            externalBinding.references.push(ref);
        }

        const processedBindings = new Set<SymbolRow<SymbolNode>>();
        let outputBinding: SymbolRow<SymbolNode> | undefined;

        let instanceCompound: CompoundStatementNode;

        if (instanceBody.type === 'compound_statement') {
            instanceCompound = instanceBody;
        } else {
            // make compound from expression for ease of use
            instanceCompound = ast.createCompoundStatement([
                ast.createReturnStatement(
                    instanceBody
                )
            ]);
            if (!output) {
                throw new Error(`An output must be passed if body is expression`);
            }
        }

        if (output) {
            // return statement to declaration
            const returnStatement = instanceCompound.statements
                .find(statement => statement.type === 'return_statement') as ReturnStatementNode | undefined;
            if (!returnStatement) {
                throw new Error(`Output identifier passed but no return statement in compound node found`);
            }
            builder.spliceStatement(instanceCompound, returnStatement)
            const declaration = ast.createDeclaration(
                output.identifier,
                returnStatement.expression,
            );
            const declarationStatement = ast.createDeclarationStatement(
                output.specifier, declaration);
            outputBinding = { initializer: declaration, references: [declaration] };
            builder.addStatementToCompound(instanceCompound, instanceScope, declarationStatement, undefined, {
                [output.identifier]: outputBinding,
            });
        }

        // params
        for (const [param, { replacementIdentifier }] of Object.entries(paramMapping)) {
            const paramSymbolRow = builder.findSymbolOfScopeBranch(instanceScope, param);
            if (!paramSymbolRow) {
                throw new Error(`Undeclared binding for identifier "${param}"`);
            }
            processedBindings.add(paramSymbolRow);
            const referencesWithoutDeclaration = paramSymbolRow.references
                .filter(astNode => astNode.type !== 'parameter_declaration');

            const targetBinding = builder.findSymbolOfScopeBranch(targetScope, replacementIdentifier);
            if (!targetBinding) {
                throw new Error(`Undeclared binding for identifier "${replacementIdentifier}"`);
            }
            builder.mergeAndRenameReferences(targetBinding, referencesWithoutDeclaration);
        }

        // locals
        for (const [bindingIdentifier, binding] of Object.entries(instanceScope.bindings)) {
            if (processedBindings.has(binding)) {
                continue;
            }
            if (binding !== outputBinding) {
                const localIdentifier = GeometryContext.getIdentifierName('local', localName, bindingIdentifier);
                builder.renameReferences(binding.references, localIdentifier);
            }
            builder.declareBinding(targetScope.bindings, binding);
        }

        const newStatementReference: StatementNode[] = [];

        // add statements
        for (const statement of instanceCompound.statements) {
            builder.addStatementToCompound(targetBody, targetScope, statement, beforeStatement);
            newStatementReference.push(statement);
        }
        // remaining scopes
        builder.moveDescendants(instanceProg, instanceScope, targetProg, targetScope);

        return newStatementReference;
    }

    private getTemplateProgramInstance(template: GNodeTemplate) {
        // TODO cache
        const program = parseMarbleLanguage(template.instructions, { quiet: true });

        const globalSymbolCount = Object.keys(program.scopes[0].bindings).length;
        if (globalSymbolCount !== 0) {
            throw new Error(`Template instructions must only contain a single method`);
        }
        const func = builder.findFirstFunction(program);
        const inputParams = ast.getParameterIdentifiers(func.prototype.parameters);
        for (const [ typeNode, paramIdentifier ] of inputParams) {
            if (!template.rows.find(row => row.id === paramIdentifier)) {
                throw new Error(`Function parameter "${paramIdentifier}" is not a row on template.`);
            }
        }
        return program;
    }
}

interface LambdaDeclaration {
    lambdaType: LambdaTypeSpecifierNode;
    lambdaExpression: LambdaExpressionNode;
    lambdaScope: Scope;
}

type ParamMapping = ObjMap<{
    replacementIdentifier: string;
}>