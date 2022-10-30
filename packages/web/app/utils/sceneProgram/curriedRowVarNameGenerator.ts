import { getRowMetadata } from "../../components/GeometryRowRoot";
import { InputOnlyRowT, JointDirection, ProgramConstant, ProgramTextureVar, ProgramTextureVarMapping, RowZ, TEXTURE_VAR_DATATYPE_SIZE } from "../../types";
import { assertRowHas } from "../geometries/assertions";
import { getRowById } from "../geometries/getRows";
import rowLocationKey from "../geometries/rowLocationKey";
import { OperationInformation } from './createOperations';
import { generateConstantName, generateTextureVarName } from "./programSymbolNames";

function createTextureVar(nodeIndex: number, rowIndex: number, row: RowZ, textureCoordinate: number)
{
    if (!assertRowHas<InputOnlyRowT>(row, 'value', 'dataType'))
    {
        console.log({ nodeIndex, rowIndex });
        throw new Error(`Row (${nodeIndex + ', ' + rowIndex}) must inherit from type BaseInputRowT`);
    }

    const variable: ProgramTextureVar =
    {
        name: generateTextureVarName(nodeIndex, rowIndex), 
        dataType: row.dataType,
        textureCoordinate,
    };
    
    return variable;
}

function createConstant(nodeIndex: number, rowIndex: number, row: RowZ)
{
    if (!assertRowHas<InputOnlyRowT>(row, 'value', 'dataType'))
    {
        console.log({ nodeIndex, rowIndex });
        throw new Error(`Row (${nodeIndex + ', ' + rowIndex}) must inherit from type BaseInputRowT`);
    }

    const constant: ProgramConstant =
    {
        name: generateConstantName(nodeIndex, rowIndex), 
        dataType: row.dataType,
        value: row.value,
    };
    
    return constant;
}

export default function curriedRowVarNameGenerator(info: OperationInformation)
{
    const { nodeIndex, node, incomingEdges, outgoingEdges, textureCoordinateCounter, partialProgram } = info;

    return (rowId: string, direction: JointDirection) =>
    {
        const { rowIndex, row } = 
            getRowById<InputOnlyRowT>(node, rowId);

        if (direction === 'input')
        {
            // case 1: connection
            const incomingEdgeKey = incomingEdges?.[rowIndex]?.edgeKey;
            if (incomingEdgeKey) 
                return incomingEdgeKey;

            // case 2: fallback function argument
            if (row.alternativeArg)
                return row.alternativeArg;

            const rowMetadata = getRowMetadata(row);

            // case 3: parameter texture lookup
            if (rowMetadata.dynamicValue)
            {
                const textureCoord = textureCoordinateCounter.current;
                const size = TEXTURE_VAR_DATATYPE_SIZE[row.dataType];
                textureCoordinateCounter.current += size;

                const textureVar = createTextureVar(nodeIndex, rowIndex, row, textureCoord);
                partialProgram.textureVars.push(textureVar);

                const textureVarMapping: ProgramTextureVarMapping = 
                {
                    textureCoordinate: textureVar.textureCoordinate,
                    dataTypes: textureVar.dataType,
                    nodeIndex,
                    rowIndex,
                };
                const uniqueRowKey = rowLocationKey(node.id, row.id);
                partialProgram.textureVarMappings[uniqueRowKey] = textureVarMapping;

                return textureVar.name;
            }

            // case 4: fixed constant
            const constant = createConstant(nodeIndex, rowIndex, row);
            partialProgram.constants.push(constant);
            return constant.name;
        }
        else
        {
            const outgoingEdgeKey = outgoingEdges?.[rowIndex]?.[0]?.edgeKey;
            if (outgoingEdgeKey) return outgoingEdgeKey;

            throw new Error(`A node should not be compiled to an operation if it's not needed in the program.`);
        }
    }
}

export type RowVarNameGenerator = ReturnType<typeof curriedRowVarNameGenerator>;