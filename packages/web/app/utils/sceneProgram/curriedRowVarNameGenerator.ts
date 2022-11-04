import { getRowMetadata } from "../../components/GeometryRowRoot";
import { GNodeZ, InputOnlyRowT, JointLocation, ObjMap, OutputRowT, PartialProgram, ProgramConstant, ProgramTextureVar, ProgramTextureVarMapping, TEXTURE_VAR_DATATYPE_SIZE } from "../../types";
import { Counter } from "../Counter";
import { GeometryEdge } from "../geometries/generateAdjacencyLists";
import { getRowById } from "../geometries/getRows";
import { jointLocationHash } from "../geometries/locationHashes";

export class RowVarNameGenerator
{
    constructor(
        private nodeIndex: number,
        private node: GNodeZ,
        private textureCoordinateCounter: Counter,
        private partialProgram: PartialProgram,
        private incomingEdges?: ObjMap<GeometryEdge>,
    ) {}

    private createConstant(rowIndex: number, row: InputOnlyRowT)
    {
        const name = [ 'const_to', this.nodeIndex, rowIndex ].join('_');
        
        const constant: ProgramConstant =
        {
            name,
            dataType: row.dataType,
            value: row.value,
        };
        return constant;
    }
    
    private createTextureVar(rowIndex: number, row: InputOnlyRowT, textureCoordinate: number)
    {
        const name = [ 'tex_to', this.nodeIndex, rowIndex ].join('_');

        const variable: ProgramTextureVar =
        {
            name, 
            dataType: row.dataType,
            textureCoordinate,
        };
        
        return variable;
    }

    private hashOutput(nodeIndex: number, rowIndex: number)
    {
        return [ 'edge_from', nodeIndex, rowIndex ].join('_');
    }

    private getEdgeInto(rowIndex: number)
    {
        return this.incomingEdges?.[rowIndex];
    }

    input(rowId: string)
    {
        const { row, rowIndex } = getRowById<InputOnlyRowT>(this.node, rowId);

        // case 1: connection
        const incomingEdge = this.getEdgeInto(rowIndex);
        if (incomingEdge) 
            return this.hashOutput(...incomingEdge.fromIndices);

        // case 2: fallback function argument
        if (row.alternativeArg)
            return row.alternativeArg;

        const rowMetadata = getRowMetadata(row);

        // case 3: parameter texture lookup
        if (rowMetadata.dynamicValue)
        {
            const size = TEXTURE_VAR_DATATYPE_SIZE[row.dataType];
            const textureCoord = this.textureCoordinateCounter.nextInts(size);

            const textureVar = this.createTextureVar(rowIndex, row, textureCoord);
            this.partialProgram.textureVars.push(textureVar);

            const textureVarMapping: ProgramTextureVarMapping = 
            {
                textureCoordinate: textureVar.textureCoordinate,
                dataTypes: textureVar.dataType,
                nodeIndex: this.nodeIndex,
                rowIndex,
            };
            const location: JointLocation =
            {
                nodeId: this.node.id,
                rowId: row.id,
                subIndex: 0,
            };
            const uniqueRowKey = jointLocationHash(location);
            this.partialProgram.textureVarMappings[uniqueRowKey] = textureVarMapping;

            return textureVar.name;
        }

        // case 4: fixed constant
        const constant = this.createConstant(rowIndex, row);
        this.partialProgram.constants.push(constant);
        return constant.name;
    }

    output(rowId: string)
    {
        const { rowIndex } = getRowById<OutputRowT>(this.node, rowId);
        return this.hashOutput(this.nodeIndex, rowIndex);
    }

    stacked(rowId: string): string[]
    {
        throw new Error(`Not implemented`);
    }
}

// export default function curriedRowVarNameGenerator(info: OperationInformation)
// {
//     const { nodeIndex, node, incomingEdges, outgoingEdges, textureCoordinateCounter, partialProgram } = info;

//     return (rowId: string, direction: JointDirection | 'stacked') =>
//     {
//         const { rowIndex, row } = 
//             getRowById<InputOnlyRowT>(node, rowId);

//         if (direction === 'input')
//         {
//             // case 1: connection
//             const incomingEdgeKey = incomingEdges?.[rowIndex]?.outputHash;
//             if (incomingEdgeKey) 
//                 return incomingEdgeKey;

//             // case 2: fallback function argument
//             if (row.alternativeArg)
//                 return row.alternativeArg;

//             const rowMetadata = getRowMetadata(row);

//             // case 3: parameter texture lookup
//             if (rowMetadata.dynamicValue)
//             {
//                 const textureCoord = textureCoordinateCounter.current;
//                 const size = TEXTURE_VAR_DATATYPE_SIZE[row.dataType];
//                 textureCoordinateCounter.current += size;

//                 const textureVar = createTextureVar(nodeIndex, rowIndex, row, textureCoord);
//                 partialProgram.textureVars.push(textureVar);

//                 const textureVarMapping: ProgramTextureVarMapping = 
//                 {
//                     textureCoordinate: textureVar.textureCoordinate,
//                     dataTypes: textureVar.dataType,
//                     nodeIndex,
//                     rowIndex,
//                 };
//                 const uniqueRowKey = jointLocationHash(node.id, row.id);
//                 partialProgram.textureVarMappings[uniqueRowKey] = textureVarMapping;

//                 return textureVar.name;
//             }

//             // case 4: fixed constant
//             const constant = createConstant(nodeIndex, rowIndex, row);
//             partialProgram.constants.push(constant);
//             return constant.name;
//         }
//         else
//         {
//             const outgoingEdgeKey = outgoingEdges?.[rowIndex]?.[0]?.outputHash;
//             if (outgoingEdgeKey) return outgoingEdgeKey;

//             throw new Error(`A node should not be compiled to an operation if it's not needed in the program.`);
//         }
//     }
// }

// export type RowVarNameGenerator = ReturnType<typeof curriedRowVarNameGenerator>;