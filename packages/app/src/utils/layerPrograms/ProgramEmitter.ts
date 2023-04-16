import { FlowGraph, FlowGraphContext, ProjectContext, TypeSpecifier } from "@marble/language";
import { generate } from "@shaderfrog/glsl-parser";
import { ParameterDeclarationNode, TypeSpecifierNode } from "@shaderfrog/glsl-parser/ast";
import { Layer, Obj } from "../../types";
import ast from "./AstUtils";

export class ProgramEmitter {

    // private functionBlocks = new Map<FunctionSignatureId, string>();
    // public updateAssets() {
    // }

    public emitPrograms(layers: Obj<Layer>, flows: Obj<FlowGraph>, projectContext: ProjectContext) {
        // for (const layer of Object.values(layers)) {
        //     this.emitProgram(layer, flows, projectContext);
        // }

        for (const flowId of Object.keys(flows)) {
            const flow = flows[flowId];
            const flowContext = projectContext.flows[flowId];
            this.emitFlowGraph(flow, flowContext);
        }
    }

    public emitFlowGraph(flow: FlowGraph, context: FlowGraphContext) {
        if (flow.outputs.length !== 1) {
            throw new Error(`implement`);
        }
        const [output] = flow.outputs;
        const functionReturnType = this.parseDataType(output.dataType);
        ast.addTypeSpecWhitespace(functionReturnType);

        const functionParameters: ParameterDeclarationNode[] = flow.inputs.map(input => {
            const specNode = this.parseDataType(input.dataType);
            ast.addTypeSpecWhitespace(specNode);
            return ast.createParameterDeclaration(
                specNode,
                ast.createIdentifier(input.id),
            );
        });

        const functionName = context.signature.id.split(':')[1];
        const statements: any = [];

        const functionNode = ast.createFunction(
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
            ),
            ast.createCompoundStatement(
                statements,
            )
        );

        const functionCode = generate(functionNode);
        console.log(functionCode);
    }

    public parseDataType(dataType: TypeSpecifier): TypeSpecifierNode {
        if (dataType.type === 'list') {
            const elementExpression = this.parseDataType(dataType.elementType);
            return ast.createTypeSpecifier(
                elementExpression.specifier,
                ast.createQuantifier(
                    dataType.length ? (
                        ast.createLiteral(
                            dataType.length.toString(),
                        )
                    ) : (
                        null
                    )
                )
            )
        }
        if (dataType.type === 'primitive') {
            return ast.createTypeSpecifier(
                ast.createKeyword(
                    dataType.primitive,
                )
            );
        }
        if (dataType.type === 'reference') {
            return ast.createTypeSpecifier(
                ast.createKeyword(
                    dataType.name,
                )
            );
        }

        throw new Error(`${dataType.type} not supported`);
    }
}