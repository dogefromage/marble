import { GNodeZ, ObjMap, ProgramConstant, ProgramTextureVar } from "../../types";
import { formatValueGLSL, textureLookupDatatype } from "../codeGeneration/formatValue";
import { Counter } from "../Counter";
import { GeometryEdge } from "../geometries/generateAdjacencyLists";
import { RowVarNameGenerator } from "./curriedRowVarNameGenerator";

function createConstantCode(c: ProgramConstant)
{
    const rhs = formatValueGLSL(c.value, c.dataType);
    return `${c.dataType} ${c.name} = ${rhs};`
}

function createTextureVarCode(tv: ProgramTextureVar)
{
    const rhs = textureLookupDatatype(tv.textureCoordinate, tv.dataType);
    return `${tv.dataType} ${tv.name} = ${rhs};`
}

export function compileNodeInstructions(
    nodeIndex: number,
    node: GNodeZ,
    textureCoordinateCounter: Counter,
    incomingEdges: ObjMap<GeometryEdge[]>,
)
{
    const varNameGenerator = new RowVarNameGenerator(
        nodeIndex, 
        node, 
        textureCoordinateCounter, 
        incomingEdges, 
    );

    const compiledInstructions: string[] = [];
    const includedTokens: string[] = [];

    const instructionTemplateLines = node.instructionTemplates.split('\n');

    for (const line of instructionTemplateLines)
    {
        const trimmedLine = line.trim();

        if (!trimmedLine.length) continue; // empty

        // 1. includes
        const includeRegex = /#INCLUDE\s+([\w]+(?:\s*\,\s*[\w]+)*)\s*;/;
        const includeMatch = node.instructionTemplates.match(includeRegex);
        if (includeMatch)
        {
            const tokensMatch = includeMatch[1] || '';
            tokensMatch
                .split(',')
                .forEach(token => 
                    includedTokens.push(token.trim())
                );
            
            continue;
        }

        // 2. instruction
        let compiledLine = trimmedLine;

        // row injections
        const rowInjectionMatch = /\$\w+/;
        while (true)
        {
            const match = compiledLine.match(rowInjectionMatch);
            if (!match) break;

            const rowName = match[1];
            const varName = varNameGenerator.rowToVariable(rowName);
            compiledLine = compiledLine.replace(rowName, varName);
        }

        // TODO local declarations
        compiledInstructions.push(compiledLine);
    }

    const { constants, textureVars, textureVarMappings } = varNameGenerator.popIncrementalMetadata();
    const constantCode = constants.map(createConstantCode);
    const textureVarCode = textureVars.map(createTextureVarCode);

    const totalInstructions = [
        ...constantCode,
        ...textureVarCode,
        ...compiledInstructions,
    ];

    return {
        instructions: totalInstructions,
        includedTokens,
        textureVarMappings,
    };
}

// interface CreateOperationProps<O extends ProgramOperationTypes>
// {
//     varNameGenerator: RowVarNameGenerator;
//     operationOps: ProgramOperationOptions<O>;
// }

// export function parseNodeOperations(
//     nodeIndex: number,
//     node: GNodeZ,
//     textureCoordinateCounter: Counter,
//     partialProgram: IncrementalProgramMethod,
//     incomingEdges: ObjMap<GeometryEdge[]>,
// ): ProgramOperation[]
// {
//     const varNameGenerator = new RowVarNameGenerator(
//         nodeIndex, 
//         node, 
//         textureCoordinateCounter, 
//         partialProgram,
//         incomingEdges, 
//     );

//     return node.operations.map(operationOps =>
//     {
//         const opType = operationOps.type;

//         const props: CreateOperationProps<ProgramOperationTypes> = 
//         { 
//             varNameGenerator, 
//             operationOps,
//         };

//         switch (opType)
//         {
//             case ProgramOperationTypes.Return:
//                 return createReturnOperation(props as CreateOperationProps<typeof opType>);
//             case ProgramOperationTypes.BinaryArithmetic:
//                 return createBinaryArithmeticOperation(props as CreateOperationProps<typeof opType>);
//             case ProgramOperationTypes.Invocation:
//                 return createInvocationOperation(props as CreateOperationProps<typeof opType>);
//             case ProgramOperationTypes.InvocationTree:
//                 return createInvocationTreeOperation(props as CreateOperationProps<typeof opType>);
//             default:
//                 throw new Error(`Operation not found`);
//         }
//     });
// }

// function createReturnOperation(props: CreateOperationProps<ProgramOperationTypes.Return>)
// {
//     const { varNameGenerator: g, operationOps } = props;

//     const outputOp: ReturnOperation = 
//     {
//         type: ProgramOperationTypes.Return,
//         var_input: g.input(operationOps.var_input),
//     }
//     return outputOp;
// }

// function createBinaryArithmeticOperation(props: CreateOperationProps<ProgramOperationTypes.BinaryArithmetic>)
// {
//     const { varNameGenerator: g, operationOps } = props;

//     const arithmeticOp: BinaryArithmeticOperation = 
//     {
//         type: ProgramOperationTypes.BinaryArithmetic,
//         operation: operationOps.operation,
//         var_lhs: g.input(operationOps.row_lhs),
//         var_rhs: g.input(operationOps.row_rhs),
//         var_output: g.output(operationOps.row_output),
//         type_output: operationOps.type_output,
//     }
//     return arithmeticOp;
// }

// function createInvocationOperation(props: CreateOperationProps<ProgramOperationTypes.Invocation>)
// {
//     const { varNameGenerator: g, operationOps } = props;

//     const invoc: InvocationOperation = 
//     {
//         type: ProgramOperationTypes.Invocation,
//         var_args: operationOps.row_args.map(
//             id => g.input(id)
//         ),
//         name_function: operationOps.name_function,
//         var_output: g.output(operationOps.row_output),
//         type_output: operationOps.type_output,
//     }
//     return invoc;
// }

// function createInvocationTreeOperation(props: CreateOperationProps<ProgramOperationTypes.InvocationTree>)
// {
//     const { varNameGenerator: g, operationOps } = props;

//     const invocTree: InvocationTreeOperation = 
//     {
//         type: ProgramOperationTypes.InvocationTree,
//         name_function: operationOps.name_function,
//         var_args: g.stacked(operationOps.row_args),
//         zero_value: operationOps.zero_value,
//         var_output: g.output(operationOps.row_output),
//         type_output: operationOps.type_output,
//     }
//     return invocTree;
// }