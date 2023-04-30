import * as ml from "@marble/language";
import { generate } from "@shaderfrog/glsl-parser";
import { AstNode, IdentifierNode, ParameterDeclarationNode, TypeSpecifierNode } from "@shaderfrog/glsl-parser/ast";
import { Layer, LayerProgram, Obj } from "../../types";
import { internalNodeFunctions } from "../../types/flows/setup";
import ast from "./AstUtils";

function unsupported(msg: string) {
    return new Error(`Unsupported: ${msg}`);
}

export class ProgramEmitter {

    public emitPrograms(projectContext: ml.ProjectContext, layers: Obj<Layer>) {
        const newPrograms: LayerProgram[] = [];
        for (const [layerId, topFlowDeps] of Object.entries(projectContext.entryPointDependencies)) {
            const sortedUsedFlows = projectContext.topologicalFlowOrder
                .filter(flowId => topFlowDeps.has(flowId));

            try {
                const layer = this.assertDef(layers[layerId]);
                const newLayerProgram = this.emitProgram(projectContext, layer, sortedUsedFlows);
                newPrograms.push(newLayerProgram);
            } catch (e) {
                if (e instanceof ProgramEmissionException) {
                    // console.warn(e.message);
                } else {
                    throw e;
                }
            }
        }

        return newPrograms;
    }

    private emitProgram(projectContext: ml.ProjectContext, layer: Layer, sortedUsedFlows: string[]): LayerProgram {
        // console.log(`Program (layer=${layer.id}):`);

        const flowFunctionBlocks: string[] = [];
        const requiredStructures = new Set<string>();
        const requiredBuiltins = new Set<string>();

        for (const flowId of sortedUsedFlows) {
            const flowContext = this.assertExistsAndNoProblems(projectContext.flowContexts[flowId]);
            const flowEmission = this.emitFlow(flowContext);
            // structures
            flowFunctionBlocks.push(flowEmission.functionCode);
            for (const structureName of flowEmission.requiredStructures) {
                requiredStructures.add(structureName);
            }
            for (const builtinId of flowEmission.requiredBuiltins) {
                requiredBuiltins.add(builtinId);
            }
        }

        const builtinBlocks = Array
            .from(requiredBuiltins)
            .map(blockId => this.assertDef(internalNodeFunctions[blockId]));

        const structureDefinitions = Array
            .from(requiredStructures)
            .map(structName => {
                const attributes = structName.split('_');
                return (
                    ast.createStruct(
                        ast.createIdentifier(structName),
                        attributes.map((attribute, index) => (
                            ast.createStructDeclaration(
                                ast.createTypeSpecifier(
                                    ast.createIdentifier(attribute),
                                ),
                                ast.createIdentifier(
                                    this.getAttributeName(index)
                                )
                            )
                        ))
                    )
                )
            })
            .map(generate);

        const programCode = [
            ...structureDefinitions,
            ...builtinBlocks,
            ...flowFunctionBlocks,
        ].join('\n');

        return {
            id: layer.id,
            name: layer.name,
            drawIndex: layer.drawIndex,
            programCode,
            entryFunctionName: layer.entryFlowId,
        };
    }

    private emitFlow(flowContext: ml.FlowGraphContext) {
        // console.log(`Flow (id=${flowContext.ref.id}):`);
        // keeps track of defined symbols
        const declarations = new Set<string>();
        const requiredStructures = new Set<string>();
        const requiredBuiltins = new Set<string>();

        // defines parameter symbols and generates prototype node
        const functionPrototype = this.generateFunctionPrototype(flowContext, declarations);

        // statements 
        const statements: any[] = [];
        for (const nodeId of flowContext.sortedUsedNodes) {
            const nodeContext = this.assertExistsAndNoProblems(flowContext.nodeContexts[nodeId]);
            this.transpileNode(statements, declarations, nodeContext);

            const signature = nodeContext.templateSignature!;
            if (signature.outputs.length > 1) {
                const outputType = this.getRowMapType(signature.outputs);
                const structureIdentifier = (outputType.specifier as IdentifierNode).identifier;
                requiredStructures.add(this.assertDef(structureIdentifier));
            }
            if (signature.id.startsWith('internal:')) {
                requiredBuiltins.add(signature.id);
            }
        }

        const compoundStatement = ast.createCompoundStatement(
            statements,
        );
        ast.correctIndent(compoundStatement, 4);

        const functionNode = ast.createFunction(
            functionPrototype,
            compoundStatement,
        );
        const functionCode = generate(functionNode);

        // console.log(functionCode);

        return {
            functionCode,
            requiredStructures,
            requiredBuiltins,
        }
    }

    private transpileNode(statements: any[], declarations: Set<string>, nodeContext: ml.FlowNodeContext) {
        const signature = this.assertDef(nodeContext.templateSignature);
        const [signatureType, signatureName] = signature.id.split(':') as [ml.FlowSignatureSources, string];

        if (signatureType === 'syntax') {
            if (signatureName === 'input') {
                this.transpileSyntaxInputNode(statements, declarations, nodeContext, signature);
                return;
            }
            if (signatureName === 'output') {
                this.transpileSyntaxOutputNode(statements, declarations, nodeContext, signature);
                return;
            }
            if (signatureName.startsWith('combine_')) {
                this.transpileSyntaxCombineNode(statements, declarations, nodeContext, signature)
                return;
            }
            if (signatureName.startsWith('separate_')) {
                this.transpileSyntaxSeparateNode(statements, declarations, nodeContext, signature)
                return;
            }

            console.warn(`no implementation for syntax node with name ${signatureName}`)
        } else {
            this.transpileCallNode(statements, declarations, nodeContext, signature)
            return;
        }
    }

    private transpileSyntaxInputNode(statements: any[], declarations: Set<string>, nodeContext: ml.FlowNodeContext, signature: ml.FlowSignature) {
        const nodeId = nodeContext.ref.id;
        for (const output of signature.outputs) {
            const paramName = this.getParameterName(output.id);
            const outputName = this.getOutputName(nodeId, output.id);
            declarations.add(outputName);
            statements.push(
                ast.createDeclarationStatement(
                    ast.createFullySpecifiedType(
                        this.parseDataType(output.dataType),
                    ),
                    ast.createDeclaration(
                        outputName, ast.createIdentifier(paramName)
                    )
                )
            );
        }
    }

    private transpileSyntaxCombineNode(statements: any[], declarations: Set<string>, nodeContext: ml.FlowNodeContext, signature: ml.FlowSignature) {
        const argExpressions = this.getArgumentExpressions(nodeContext, signature);
        const structType = this.getRowMapType(signature.outputs);

        const outputRow = this.assertDef(signature.outputs[0]);
        const outputName = this.getOutputName(nodeContext.ref.id, outputRow.id);
        declarations.add(outputName);
        statements.push(
            ast.createDeclarationStatement(
                ast.createFullySpecifiedType(
                    structType,
                ),
                ast.createDeclaration(
                    outputName,
                    ast.createFunctionCall(
                        structType,
                        argExpressions,
                    )
                )
            )
        );
    }

    private transpileSyntaxSeparateNode(statements: any[], declarations: Set<string>, nodeContext: ml.FlowNodeContext, signature: ml.FlowSignature) {
        const argExpression = this.getArgumentExpressions(nodeContext, signature)[0];
        for (const output of signature.outputs) {
            const outputName = this.getOutputName(nodeContext.ref.id, output.id);
            declarations.add(outputName);
            statements.push(
                ast.createDeclarationStatement(
                    ast.createFullySpecifiedType(
                        this.parseDataType(output.dataType)
                    ),
                    ast.createDeclaration(
                        outputName,
                        ast.createPostfix(
                            argExpression,
                            this.getSeparatorFieldPostfix(signature.id, output.id) as any,
                        )
                    )
                )
            );
        }
    }

    private getSeparatorFieldPostfix(signatureId: string, outputId: string) {
        if (signatureId === 'syntax:separate_mat3') {
            const num = parseInt(outputId.match(/\d/)![0]) - 1;
            return (
                ast.createQuantifier(
                    ast.createLiteral(num.toString())
                )
            )
        }

        return (
            ast.createFieldSelection(
                ast.createLiteral(outputId)
            )
        )
    }

    private transpileSyntaxOutputNode(statements: any[], declarations: Set<string>, nodeContext: ml.FlowNodeContext, signature: ml.FlowSignature) {
        const argExpressions = this.getArgumentExpressions(nodeContext, signature);

        let returnExpression: AstNode | undefined;

        if (argExpressions.length === 1) {
            returnExpression = argExpressions[0];
        } else if (argExpressions.length > 1) {
            const returnType = this.getRowMapType(signature.inputs);
            returnExpression = (
                ast.createFunctionCall(
                    returnType,
                    argExpressions,
                )
            );
        }
        if (!returnExpression) {
            return;
        }
        statements.push(
            ast.createReturnStatement(returnExpression)
        );
    }

    private transpileCallNode(statements: any[], declarations: Set<string>, nodeContext: ml.FlowNodeContext, signature: ml.FlowSignature) {
        const argExpressions = this.getArgumentExpressions(nodeContext, signature);

        const callExpression = (
            ast.createFunctionCall(
                ast.createIdentifier(signature.id.split(':')[1]),
                argExpressions
            )
        );

        const nodeId = nodeContext.ref.id;

        if (signature.outputs.length === 0) {
            return;
        }
        if (signature.outputs.length === 1) {
            const [singleOutput] = signature.outputs;
            const outputName = this.getOutputName(nodeId, singleOutput.id);
            declarations.add(outputName);
            statements.push(
                ast.createDeclarationStatement(
                    ast.createFullySpecifiedType(
                        this.parseDataType(singleOutput.dataType),
                    ),
                    ast.createDeclaration(
                        outputName,
                        callExpression,
                    )
                )
            );
        } else {
            // more than one output
            const mainOutputName = this.getMainOutputName(nodeId);
            declarations.add(nodeId);
            statements.push(
                ast.createDeclarationStatement(
                    ast.createFullySpecifiedType(
                        this.getRowMapType(
                            signature.outputs,
                        )
                    ),
                    ast.createDeclaration(
                        mainOutputName, callExpression,
                    )
                )
            );
            for (let i = 0; i < signature.outputs.length; i++) {
                const output = signature.outputs[i];
                if (output.id === 'all') {
                    throw new ProgramEmissionException('reserved-name')
                }
                const outputName = this.getOutputName(nodeId, output.id);
                declarations.add(outputName);
                statements.push(
                    ast.createDeclarationStatement(
                        ast.createFullySpecifiedType(
                            this.parseDataType(
                                output.dataType,
                            )
                        ),
                        ast.createDeclaration(
                            outputName,
                            ast.createPostfix(
                                ast.createIdentifier(mainOutputName),
                                ast.createFieldSelection(
                                    ast.createLiteral(this.getAttributeName(i))
                                )
                            )
                        )
                    )
                )
            }
        }
    }

    private getArgumentExpressions(nodeContext: ml.FlowNodeContext, signature: ml.FlowSignature) {
        const argExpressions: any[] = [];
        for (const inputRow of signature.inputs) {
            const rowContext = this.assertExistsAndNoProblems(nodeContext.rowContexts[inputRow.id]);
            const rowState = nodeContext.ref.rowStates[inputRow.id];
            if (rowState?.connections.length) {
                const [connection] = rowState.connections;
                const outputName = this.getOutputName(connection.nodeId, connection.outputId);
                argExpressions.push(
                    ast.createIdentifier(outputName)
                )
            } else {
                const displayValue = this.assertDef(rowContext.displayValue);
                const initializer = this.generateInitializer(displayValue, inputRow.dataType);
                argExpressions.push(initializer);
            }
        }
        return argExpressions;
    }

    private generateInitializer(value: ml.InitializerValue, dataType: ml.TypeSpecifier): AstNode {
        if (dataType.type === 'primitive') {
            return ast.createFloatLiteral(value as number)
        }

        if (dataType.type === 'reference') {
            if (dataType.name === 'vec3') {
                const { x, y, z } = value as any;
                return (
                    ast.createFunctionCall(
                        ast.createTypeSpecifier(
                            ast.createKeyword('vec3')
                        ), [
                        ast.createFloatLiteral(x),
                        ast.createFloatLiteral(y),
                        ast.createFloatLiteral(z),
                    ],
                    )
                );
            }

            if (dataType.name === 'mat3') {
                const { column_1, column_2, column_3 } = value as any;
                const columnInitializers = [column_1, column_2, column_3]
                    .map(col => this.generateInitializer(col, ml.types.createReference('vec3')));
                return (
                    ast.createFunctionCall(
                        ast.createTypeSpecifier(
                            ast.createKeyword('mat3'),
                        ),
                        columnInitializers,
                    )
                );
            }
        }

        throw new Error(`Unknown initializer, ${dataType.type}`);
    }

    private generateFunctionPrototype(flowContext: ml.FlowGraphContext, declarations: Set<string>) {
        const { id, outputs, inputs } = flowContext.flowSignature;

        // function prototype
        const functionName = id.split(':')[1];
        const functionReturnType = this.getRowMapType(outputs);
        ast.addTypeSpecWhitespace(functionReturnType);

        const functionParameters: ParameterDeclarationNode[] = inputs.map(input => {
            const specNode = this.parseDataType(input.dataType);
            ast.addTypeSpecWhitespace(specNode);
            const parameterName = this.getParameterName(input.id);
            declarations.add(parameterName);
            return ast.createParameterDeclaration(
                specNode,
                ast.createIdentifier(parameterName),
            );
        });
        return (
            ast.createFunctionPrototype(
                ast.createFunctionHeader(
                    ast.createFullySpecifiedType(
                        functionReturnType,
                    ),
                    ast.createIdentifier(
                        functionName,
                    )
                ),
                functionParameters,
            )
        );
    }

    private getParameterName(inputId: string) {
        return `param_${inputId}`;
    }
    private getMainOutputName(nodeId: string) {
        return `${nodeId}_all`;
    }
    private getOutputName(nodeId: string, rowId: string) {
        return `${nodeId}_${rowId}`;
    }
    private getAttributeName(attributeIndex: number) {
        return `_${attributeIndex}`;
    }

    private getRowMapType(outputs: (ml.InputRowSignature | ml.OutputRowSignature)[]) {
        if (outputs.length === 0) {
            return (
                ast.createTypeSpecifier(
                    ast.createKeyword('void')
                )
            );
        }
        if (outputs.length === 1) {
            return this.parseDataType(outputs[0].dataType);
        }

        const specNodes = outputs
            .map(output => this.parseDataType(output.dataType));

        return this.getConcatinatedStruct(specNodes);
    }

    private getConcatinatedStruct(nodes: TypeSpecifierNode[]) {
        let identifierParts: string[] = [];

        for (const node of nodes) {
            switch (node.specifier.type) {
                case 'identifier':
                    identifierParts.push(node.specifier.identifier);
                    break;
                case 'keyword':
                    identifierParts.push(node.specifier.token);
                    break;
            }
            if (node.quantifier != null) {
                throw new Error(`not supported`);
                // const quantifier = node.quantifier as QuantifierNode;
                // if (quantifier.expression.type !== 'literal') {
                //     throw new Error(`must be literal`);
                // }
                // const lit = quantifier.expression as LiteralNode;
                // identifierParts.push(lit.literal);
            }
        }

        return (
            ast.createTypeSpecifier(
                ast.createIdentifier(
                    identifierParts.join('_')
                )
            )
        );
    }

    private parseDataType(dataType: ml.TypeSpecifier): TypeSpecifierNode {
        if (dataType.type === 'array') {
            const elementExpression = this.parseDataType(dataType.elementType);
            return ast.createTypeSpecifier(
                elementExpression.specifier,
                ast.createQuantifier(
                    ast.createLiteral(
                        dataType.length.toString(),
                    )
                )
            )
        }
        if (dataType.type === 'primitive') {
            if (dataType.primitive === 'number') {
                return ast.createTypeSpecifier(
                    ast.createKeyword('float')
                );
            }
            if (dataType.primitive === 'boolean') {
                return ast.createTypeSpecifier(
                    ast.createKeyword('bool')
                );
            }
            throw unsupported(`primitive ${dataType.primitive}`);
        }
        if (dataType.type === 'reference') {
            return ast.createTypeSpecifier(
                ast.createIdentifier(
                    dataType.name,
                )
            );
        }

        throw unsupported(`dataType ${dataType.type}`)
    }

    private assertExistsAndNoProblems<C extends ml.FlowGraphContext | ml.FlowNodeContext | ml.RowContext>(ctx: C | undefined) {
        if (ctx == null || ctx.problems.length) {
            throw new ProgramEmissionException('contains-problems');
        }
        return ctx as NonNullable<C>;
    }

    private assertDef<T>(t: T) {
        if (t == null) {
            throw new ProgramEmissionException('missing-value');
        }
        return t as NonNullable<T>;
    }
}

export class ProgramEmissionException extends Error {
    constructor(
        type: 'contains-problems' | 'missing-value' | 'reserved-name'
    ) {
        super(type);
    }
}