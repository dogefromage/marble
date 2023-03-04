import { AstNode, CompoundStatementNode, DeclarationNode, DeclaratorListNode, ExpressionNode, FunctionCallNode, FunctionNode, IdentifierNode, LambdaExpressionNode, LambdaTypeSpecifierNode, ParameterDeclarationNode, parse as parseMarbleLanguage, PreprocessorNode, Program, ReturnStatementNode, Scope, StatementNode, SymbolNode, SymbolRow, TypeSpecifierNode } from '@marble/language';
import { generate as generateGlslCode } from '@shaderfrog/glsl-parser';
import { visit } from '@shaderfrog/glsl-parser/ast/ast';
import _, { clone } from 'lodash';
import objectPath from 'object-path';
import { mapDynamicValues } from '.';
import { dataTypeDescriptors, DataTypes, DependencyGraph, GeometryConnectionData, GeometryS, getDependencyKey, GNodeTemplate, Layer, LayerProgram, ObjMap, ObjMapUndef, OutputRowT, ProgramDynamicLookupMapping, ProgramInclude, splitDependencyKey } from "../../types";
import { Counter } from '../Counter';
import topSortDependencies from '../dependencyGraph/topSortDependencies';
import { generateTupleOutputType } from '../templateManager/generateDynamicTemplates';
import { LOOKUP_TEXTURE_WIDTH } from '../viewportView/GLProgramRenderer';
import { AstBuilder } from './AstBuilder';
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

        const programDeclarations: Program['program'] = [];
        const coordCounter = new Counter(LOOKUP_TEXTURE_WIDTH, textureVarRowIndex * LOOKUP_TEXTURE_WIDTH);
        const allDynamicMappings = new Array<ProgramDynamicLookupMapping>();
        const allIncludes = new Array<string>();
        const allStructs = new Array<string>();

        for (const geoId of topologicalGeometrySorting) {
            const geoOrderEl = dependencyGraph.order.get(getDependencyKey(geoId, 'geometry'))!;
            const geo = geometries[geoId];
            const data = geometryDatas[geoId];
            if (!geo || !data || geo.version != geoOrderEl.version || geo.version != data.geometryVersion) {
                return null;
            }

            const geoResult = this.compileGeometry(geo, data, coordCounter);
            if (!geoResult) {
                continue;
            }
            programDeclarations.push(geoResult.functionNode);
            allDynamicMappings.push(...geoResult.dynMappings);
            allIncludes.push(...geoResult.includes);
            allStructs.push(...geoResult.structs);
        }

        // structs
        for (const typeName of new Set(allStructs)) {
            const prefixLength = GeometryContext.tupleStructKey.length;
            const attrTypes = typeName.slice(prefixLength).split('_') as DataTypes[];
            const attributeTypeSpecs = attrTypes.map(attrTypes => parseDataType(attrTypes));
            const structDef = ast.createStructDefinition(
                ast.createStruct(
                    ast.createIdentifier(typeName),
                    attributeTypeSpecs.map((spec, index) =>
                        ast.createStructDeclaration(
                            spec,
                            ast.createIdentifier(
                                GeometryContext.getIdentifierName('struct_arg', index)
                            ),
                        )
                    )
                )
            );
            programDeclarations.unshift(structDef);
        }

        const generatedCode = generateGlslCode({
            type: 'program',
            // @ts-ignore
            program: programDeclarations,
            scopes: [],
        });
        console.info(generatedCode);

        // includes
        const programIncludeArray = new Array<ProgramInclude>();
        for (const includeIdentfier of new Set(allIncludes)) {
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

        const textureVarRow = mapDynamicValues(allDynamicMappings, geometries, geometryDatas);

        return {
            id: layer.id,
            index: layer.index,
            name: layer.name,
            hash: layerHash,
            mainProgramCode: generatedCode,
            includes: programIncludeArray,
            rootFunctionName,
            textureVarMappings: allDynamicMappings,
            textureVarRowIndex,
            textureVarRow,
        }
    }

    private compileGeometry(
        geo: GeometryS, data: GeometryConnectionData,
        dynamicCoordCounter: Counter,
    ) {
        const includes = new Set<string>();
        const dynMappings = new Array<ProgramDynamicLookupMapping>();
        const context = new GeometryContext(geo, data);
        const geoProgram = this.joinTemplatesTopologically(
            context, dynamicCoordCounter, dynMappings, includes);
        if (!geoProgram) {
            return null;
        }
        this.refactorLambdas(geoProgram);
        // this.removeIdentityDeclarations(geoProgram);
        const structs = this.findTupleStructs(geoProgram);

        geoProgram.destroy();
        const geoFunction = geoProgram.getOriginalRoot();
        ast.correctIndent(geoFunction.body, 4);

        return {
            functionNode: geoFunction,
            includes: Array.from(includes),
            structs,
            dynMappings,
        };
    }

    private findTupleStructs(program: AstBuilder<FunctionNode>) {
        const structs = new Set<string>();
        // @ts-ignore
        visit(program.getNode(), {
            type_specifier: {
                enter: path => {
                    const node = path.node;
                    const ident = node.specifier;
                    if (ident.type !== 'identifier') return;

                    if (ident.identifier.startsWith(GeometryContext.tupleStructKey)) {
                        structs.add(ident.identifier);
                    }
                }
            }
        });

        return Array.from(structs);
    }

    // private removeIdentityDeclarations(program: Program) {
    //     // @ts-ignore
    //     visit(program, {
    //         compound_statement: {
    //             exit: path => {
    //                 const statements = path.node.statements as StatementNode[];
    //                 for (let i = statements.length - 1; i >= 0; i--) {
    //                     const statement = statements[i];
    //                     if (statement.type !== 'declaration_statement') continue;
    //                     const declaratorList = statement.declaration as DeclaratorListNode;
    //                     if (declaratorList.type !== 'declarator_list') continue;;
    //                     if (declaratorList.declarations.length > 1) continue;;
    //                     const [declaration] = declaratorList.declarations;
    //                     if (declaration.initializer.type !== 'identifier') continue;;
    //                     // we know now the declaration is an identity declaration
    //                     const refIdentifier = declaration.initializer;
    //                     const refBinding = builder.findReferenceSymbolRow(program, refIdentifier)!;
    //                     const declarationBinding = builder.findReferenceSymbolRow(program, declaration)!;
    //                     const referencesWithoutInitializer = declarationBinding.references
    //                         .filter(ref => ref !== declarationBinding.initializer);
    //                     if (!refBinding) {
    //                         debugger
    //                     }
    //                     builder.mergeAndRenameReferences(refBinding, referencesWithoutInitializer);
    //                     statements.splice(i, 1);
    //                     builder.removeReferencesOfSubtree(program, statement);
    //                 }
    //             }
    //         }
    //     })
    // }

    private refactorLambdas(program: AstBuilder<FunctionNode>) {
        this.refactorLambdaReturn(program);

        const declaredLambdas = new Map<string, LambdaDefinition>();
        const lambdaCounter = new Counter(1e10, 0);

        let statementIndex = 0;
        while (true) {
            let statementClone: StatementNode | undefined;
            program.edit((node, clone) => {
                statementClone = clone(node.body.statements[statementIndex]);
            });
            if (!statementClone) {
                // end of body reached
                break;
            }

            if (statementClone.type === 'declaration_statement' &&
                statementClone.declaration.type === 'declarator_list' &&
                statementClone.declaration.specified_type.specifier.type === 'lambda_type_specifier') {
                // is lambda definition

                const lambdaExpression = statementClone.declaration.declarations[0].initializer as LambdaExpressionNode;
                if (lambdaExpression.type !== 'lambda_expression') {
                    throw new Error(`Lambda declaration was not initialized by lambda expression`);
                }
                const declarationIdentifier = statementClone.declaration.declarations[0].identifier.identifier;
                declaredLambdas.set(declarationIdentifier, {
                    lambdaExpression,
                    lambdaType: statementClone.declaration.specified_type.specifier,
                });
                // remove stmt
                program.edit(node => {
                    node.body.statements.splice(statementIndex, 1);
                });
                continue;
            } 
            // other statement

            const invocations = this.mapLambdaInvocations(program, statementIndex, declaredLambdas);

            for (const invocation of invocations) {
                const identifier = builder.getFunctionCallIdentifier(invocation)!;
                const declaration = declaredLambdas.get(identifier)!;
                this.instantiateLambda(
                    program, func, funcScope, invocation, declaration, statementClone, lambdaCounter, declaredLambdas,
                );
            }

            statementIndex++;
        }
    }

    private refactorLambdaReturn(program: AstBuilder<FunctionNode>) {
        let returnType!: LambdaTypeSpecifierNode;
        program.edit((node, clone) => {
            returnType = clone(node.prototype.header.returnType.specifier) as LambdaTypeSpecifierNode;
        });

        if (returnType.type !== 'lambda_type_specifier') {
            return;
        }

        const callArgs: string[] = [];
        // add lambda args to function prototype
        program.edit((node, clone) => {
            const params = node.prototype.parameters;
            for (let argIndex = 0; argIndex < returnType.args.length; argIndex++) {
                const arg = GeometryContext.getIdentifierName('lambda_arg', argIndex);
                callArgs.push(arg);
                const paramDeclaration = ast.createParameterDeclaration(
                    returnType.args[argIndex],
                    ast.createIdentifier(arg)
                );
                params.push(paramDeclaration);
            }
            // change function return type
            returnType.return_type.specifier.whitespace = ' ';
            node.prototype.header.returnType.specifier = returnType.return_type;
        });

        // change return expression
        program.edit((node, clone) => {
            const returnStmt = node.body.statements[node.body.statements.length - 1] as ReturnStatementNode;
            if (returnStmt?.type !== 'return_statement') {
                throw new Error(`Last statement must be return statement`);
            }
            const callExpr = ast.createFunctionCall(
                clone(returnStmt.expression),
                callArgs.map(arg => ast.createIdentifier(arg)),
            );
            returnStmt.expression = callExpr;
        })
    }

    private mapLambdaInvocations(program: AstBuilder<FunctionNode>, statementIndex: number, declaredLambdas: Map<string, LambdaDefinition>) {
        const invocations = new Array<{
            lambda: LambdaDefinition;
            callArgExpressions: ExpressionNode[];
        }>();
        program.edit((node, clone) => {
            // @ts-ignore
            visit(program, {
                function_call: {
                    exit: path => {
                        const node = path.node as FunctionCallNode;
                        const identifier = AstBuilder.getFunctionCallIdentifier(node);
                        const lambda = declaredLambdas.get(identifier!);
                        if (!lambda) return;
                        const callClone = clone(node);
                        invocations.push({ 
                            callArgExpressions: callClone.args,
                            lambda,
                        });
                    }
                }
            });
        });
        return invocations;
    }

    private instantiateLambda(
        program: AstBuilder<FunctionNode>,
        call: FunctionCallNode,
        lambdaDefinition: LambdaDefinition,
        insertBeforeIndex: number,
        instanceCounter: Counter,
        definedLambdas: Map<string, LambdaDefinition>,
    ) {
        const instanceIndex = instanceCounter.increment();

        // declare arguments
        const argumentExpressions = call.args
            .filter(arg => arg.type !== 'literal') as ExpressionNode[]; // filter commas
        const paramList = ast.getParameterIdentifiers(lambdaDefinition.lambdaExpression.header.parameters);
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
            const declarationStatement = ast.createDeclarationStatement(
                ast.createFullySpecifiedType(typeSpec),
                ast.createDeclaration(
                    replacementIdentifier, argumentExpressions[paramIndex]
                )
            );
            builder.addStatementToCompoundNoNested(func.body, funcScope, declarationStatement, beforeStatement);
            paramMapping[paramIdentifier] = { replacementIdentifier };
        }

        const lambdaBody = lambdaDefinition.lambdaExpression.body;
        const lambdaScope = lambdaDefinition.lambdaScope;

        const outIdentifier = `lambda_${instanceIndex}_out`;

        const newStatements = this.appendFunctionBody(
            program, func.body, funcScope,
            program, lambdaBody, lambdaScope,
            paramMapping,
            `l${instanceIndex}`,
            {
                baseIdentifier: outIdentifier,
                typeSpecifier: lambdaDefinition.lambdaType.return_type,
                destructure: false,
            },
            beforeStatement,
        );
        // make call into identifier of lambda value
        builder.removeReferencesOfSubtree(program, call.identifier);
        const lambdaResultRef = call as unknown as IdentifierNode;
        Object.assign(lambdaResultRef, ast.createIdentifier(outIdentifier));
        builder.addNodeReference(funcScope, lambdaResultRef);

        // recurse lambda invocation routine
        for (const newStatement of newStatements) {
            const subInvocations = this.findLambdaInvocations(newStatement, definedLambdas);
            for (const subInvocation of subInvocations) {

                const identifier = builder.getFunctionCallIdentifier(subInvocation)!;
                const declaration = definedLambdas.get(identifier)!;
                this.instantiateLambda(
                    program, func, funcScope, 
                    subInvocation, declaration, newStatement, 
                    instanceCounter, definedLambdas,
                );
            }
        }
    }

    private joinTemplatesTopologically(
        geoCtx: GeometryContext,
        dynamicCoordCounter: Counter,
        lookupMappings: ProgramDynamicLookupMapping[],
        usedIncludes: Set<string>,
    ): AstBuilder<FunctionNode> | null {
        const usedSortedNodeGenerator = geoCtx.sortUsedNodeIndices();
        if (!usedSortedNodeGenerator.length) {
            return null;
        }

        // const geoProgram = builder.createEmptyProgram();
        const methodName = GeometryContext.getIdentifierName('geometry', geoCtx.geometry.id);
        const returnTypeSpec = this.getGeometryReturnTypeSpec(geoCtx.geometry.outputs);
        const geoFunction = (
            ast.createFunction(
                ast.createFunctionPrototype(
                    ast.createFunctionHeader(
                        ast.createFullySpecifiedType(returnTypeSpec),
                        ast.createIdentifier(methodName)
                    ),
                    // params
                    geoCtx.geometry.inputs.map(input =>
                        ast.createParameterDeclaration(
                            parseDataType(input.dataType),
                            ast.createIdentifier(input.id),
                        )
                    )
                ),
                ast.createCompoundStatement([])
            )
        );
        const geoBuilder = new AstBuilder(geoFunction);

        for (const nodeIndex of usedSortedNodeGenerator) {
            geoCtx.select(nodeIndex);
            const isOutput = nodeIndex === usedSortedNodeGenerator.at(-1);
            // create template builder
            const { func: templateFunction, includes: templateIncludes } = this.getTemplateProgramInstance(geoCtx.activeNodeData.template);
            templateIncludes.forEach(inc => usedIncludes.add(inc));
            const templateBuilder = new AstBuilder(templateFunction);

            const declaredLookups = new Set<string>();

            const nodeParamStatements = new Array<StatementNode>();
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
                    const declarationStatement = ast.createDeclarationStatement(
                        ast.createFullySpecifiedType(specifier),
                        ast.createDeclaration(identifier, expression),
                    );
                    nodeParamStatements.push(declarationStatement)
                    replacementIdentifier = identifier;

                } else if (linkingRule.type === 'lookup') {
                    const { identifier, dataSize, rowDataType, rowIndex } = linkingRule;
                    if (!declaredLookups.has(identifier)) {
                        declaredLookups.add(identifier);
                        const textureCoordinate = dynamicCoordCounter.nextInts(dataSize);
                        const [_, declarationStatement] = generateTextureLookupStatement(
                            identifier, textureCoordinate, rowDataType);
                        nodeParamStatements.push(declarationStatement)
                        lookupMappings.push({
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

            // add lookup statements
            geoBuilder.edit(node => {
                node.body.statements.push(...nodeParamStatements);
            });

            const baseOutputIdentifier = GeometryContext.getIdentifierName('output', nodeIndex);

            this.appendFunctionBody(
                geoBuilder,
                templateBuilder,
                paramMapping,
                nodeIndex,
                isOutput ? undefined : {
                    baseIdentifier: baseOutputIdentifier,
                    typeSpecifier: templateFunction.prototype.header.returnType.specifier,
                    destructure: true,
                },
            );
        }

        return geoBuilder;
    }

    private getGeometryReturnTypeSpec(outputs: OutputRowT<DataTypes>[]) {

        const firstOutputDescriptor = dataTypeDescriptors[outputs[0].dataType];
        let spec: TypeSpecifierNode;
        if (firstOutputDescriptor.type === 'lambda') {
            spec = parseDataType(outputs[0].dataType);
        } else {
            const returnTypeText = generateTupleOutputType(outputs);
            spec = (
                ast.createTypeSpecifierNode(
                    ast.createIdentifier(returnTypeText)
                )
            );
        }
        ast.addTypeSpecWhitespace(spec);
        return spec;
    }

    private processIncludes(program: Program) {
        const usedIncludes = new Set<string>();
        const preprocessors = program.program.filter(node => node.type === 'preprocessor') as PreprocessorNode[];
        for (const preprocessor of preprocessors) {
            const { line } = preprocessor;
            const matchIncludes = line.match(/#\s*include\s+(\w+(?:\s*,\s*\w+)*)\s*;/i);
            if (matchIncludes != null) {
                const includesRaw = matchIncludes[1]!;
                const includes = includesRaw.split(',').map(s => s.trim());
                for (const include of includes) {
                    usedIncludes.add(include);
                }
            }
        }
        return Array.from(usedIncludes);
    }

    private appendFunctionBody(
        geoProgram: AstBuilder<FunctionNode>,
        instanceProgram: AstBuilder<FunctionNode>,
        paramMapping: ParamMapping,
        localName: string | number,
        output?: OutputInstantiationOptions,
        beforeStatement?: StatementNode,
    ) {
        const nonLocals = new Set<string>();

        if (output) {
            const outputVarNames = this.refactorReturnToDeclaration(instanceProgram, output);
            outputVarNames.forEach(name => nonLocals.add(name));
        }

        instanceProgram.edit((node, clone, rename) => {
            // rename params
            for (const param of node.prototype.parameters) {
                const paramDeclaration = AstBuilder.getSymbolNodeIdentifier(param);
                const { replacementIdentifier } = paramMapping[paramDeclaration.identifier];
                if (!replacementIdentifier) {
                    throw new Error(`No rule added for param "${paramDeclaration.identifier}"`);
                }
                rename(paramDeclaration, replacementIdentifier);
            }

            // rename locals
            for (const statement of node.body.statements) {
                if (statement.type !== 'declaration_statement') {
                    continue;
                }

                for (const declaration of statement.declaration.declarations as DeclarationNode[]) {
                    const varName = declaration.identifier.identifier;
                    if (!nonLocals.has(varName)) {
                        const localIdentifier = GeometryContext
                            .getIdentifierName('local', localName, varName);
                        rename(declaration.identifier, localIdentifier);
                    }
                }
            }
        });

        instanceProgram.destroy();
        const newStatements = instanceProgram.getOriginalRoot().body.statements;

        geoProgram.edit(node => {
            node.body.statements.push(...newStatements);
        });
    }

    private refactorReturnToDeclaration(
        instanceProgram: AstBuilder<FunctionNode>,
        output: OutputInstantiationOptions,
    ) {
        let returnStatement!: ReturnStatementNode;

        instanceProgram.edit((node, clone) => {
            const lastStatementIndex = node.body.statements.length - 1;
            const lastStatement = node.body.statements[lastStatementIndex];
            if (lastStatement.type !== 'return_statement') {
                throw new Error(`If output passed, last statement must be return statement`);
            }
            returnStatement = clone(lastStatement);
            node.body.statements.length--;
        });

        // determine name
        const outputSpec = output.typeSpecifier;
        let structTypeName: string | undefined;
        if (
            outputSpec != null &&
            outputSpec.type === 'type_specifier' &&
            outputSpec.specifier.type === 'identifier' &&
            outputSpec.specifier.identifier.startsWith(GeometryContext.tupleStructKey)
        ) {
            structTypeName = outputSpec.specifier.identifier;
        }

        // default name first element _0 if not destructured
        let baseDeclarationIdentifier = output.baseIdentifier;
        if (output.destructure && !structTypeName?.length) {
            baseDeclarationIdentifier += '_0'
        }
        const baseDeclarationStmt = ast.createDeclarationStatement(
            ast.createFullySpecifiedType(output.typeSpecifier),
            ast.createDeclaration(
                baseDeclarationIdentifier,
                returnStatement.expression,
            )
        );
        const varNames = [baseDeclarationIdentifier];
        const outputStatements = [baseDeclarationStmt];

        // destructure output
        if (output.destructure && structTypeName?.length) {
            const prefixLength = GeometryContext.tupleStructKey.length;
            const attrTypes = structTypeName!.slice(prefixLength).split('_') as DataTypes[];
            attrTypes.forEach((attr, attributeIndex) => {
                const attrTypeSpec = parseDataType(attr);
                // create postfix statement
                const destructuringIdentifier =
                    [output.baseIdentifier, attributeIndex].join('_');
                const destructureDeclarationStmt = ast.createDeclarationStatement(
                    ast.createFullySpecifiedType(attrTypeSpec),
                    ast.createDeclaration(
                        destructuringIdentifier,
                        ast.createPostfix(
                            ast.createIdentifier(output.baseIdentifier),
                            ast.createFieldSelection(
                                ast.createLiteral(
                                    GeometryContext.getIdentifierName('struct_arg', attributeIndex),
                                )
                            )
                        )
                    )
                );
                outputStatements.push(destructureDeclarationStmt);
                varNames.push(destructuringIdentifier);
            });
        }

        instanceProgram.edit(node => {
            node.body.statements.push(...outputStatements);
        });

        return varNames;
    }

    private getTemplateProgramInstance(template: GNodeTemplate) {
        // TODO cache
        const program = parseMarbleLanguage(template.instructions, { quiet: true });

        const func = program.program.find(node => node.type === 'function') as FunctionNode;
        if (!func) {
            throw new Error(`No function found on template instructions`);
        }
        const includes = this.processIncludes(program);

        const inputParams = ast.getParameterIdentifiers(func.prototype.parameters);
        for (const [typeNode, paramIdentifier] of inputParams) {
            if (!template.rows.find(row => row.id === paramIdentifier)) {
                throw new Error(`Function parameter "${paramIdentifier}" is not a row on template.`);
            }
        }

        const ref = { func, includes };
        return structuredClone(ref);
    }
}

interface LambdaDefinition {
    lambdaType: LambdaTypeSpecifierNode;
    lambdaExpression: LambdaExpressionNode;
}

type ParamMapping = ObjMap<{
    replacementIdentifier: string;
}>

interface OutputInstantiationOptions {
    typeSpecifier: TypeSpecifierNode,
    baseIdentifier: string,
    destructure: boolean,
}
