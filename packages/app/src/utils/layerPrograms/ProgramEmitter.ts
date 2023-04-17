import { ProjectContext, emitPrograms } from "@marble/language";
import { Layer, Obj } from "../../types";

export class ProgramEmitter {

    // private functionBlocks = new Map<FunctionSignatureId, string>();
    // public updateAssets() {
    // }

    public emitPrograms(projectContext: ProjectContext, layers: Obj<Layer>) {
        const topFlows = Object.values(layers).map(l => l.topFlowId);
        const programEmissions = emitPrograms(projectContext, topFlows);

        console.log('PROGRAMS');
        for (const flowEmission of programEmissions.orderedFlows) {
            console.log(flowEmission.id);
            // this.emitFlowGraph(flowEmission);
        }
    }

    // public emitFlowGraph(flow: FlowGraph, context: FlowGraphContext) {
    //     if (flow.outputs.length !== 1) {
    //         throw new Error(`implement`);
    //     }
    //     const [output] = flow.outputs;
    //     const functionReturnType = this.parseDataType(output.dataType);
    //     ast.addTypeSpecWhitespace(functionReturnType);

    //     const functionParameters: ParameterDeclarationNode[] = flow.inputs.map(input => {
    //         const specNode = this.parseDataType(input.dataType);
    //         ast.addTypeSpecWhitespace(specNode);
    //         return ast.createParameterDeclaration(
    //             specNode,
    //             ast.createIdentifier(input.id),
    //         );
    //     });

    //     const functionName = context.signature.id.split(':')[1];
    //     const statements: any = [];

    //     const functionNode = ast.createFunction(
    //         ast.createFunctionPrototype(
    //             ast.createFunctionHeader(
    //                 ast.createFullySpecifiedType(
    //                     functionReturnType,
    //                 ),
    //                 ast.createIdentifier(
    //                     functionName,
    //                 )
    //             ),
    //             functionParameters,
    //         ),
    //         ast.createCompoundStatement(
    //             statements,
    //         )
    //     );

    //     const functionCode = generate(functionNode);
    //     console.log(functionCode);
    // }

    // public parseDataType(dataType: TypeSpecifier): TypeSpecifierNode {
    //     if (dataType.type === 'list') {
    //         const elementExpression = this.parseDataType(dataType.elementType);
    //         return ast.createTypeSpecifier(
    //             elementExpression.specifier,
    //             ast.createQuantifier(
    //                 dataType.length ? (
    //                     ast.createLiteral(
    //                         dataType.length.toString(),
    //                     )
    //                 ) : (
    //                     null
    //                 )
    //             )
    //         )
    //     }
    //     if (dataType.type === 'primitive') {
    //         return ast.createTypeSpecifier(
    //             ast.createKeyword(
    //                 dataType.primitive,
    //             )
    //         );
    //     }
    //     if (dataType.type === 'reference') {
    //         return ast.createTypeSpecifier(
    //             ast.createKeyword(
    //                 dataType.name,
    //             )
    //         );
    //     }

    //     throw new Error(`${dataType.type} not supported`);
    // }
}