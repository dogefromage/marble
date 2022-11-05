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
        private incomingEdges?: ObjMap<GeometryEdge[]>,
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
        const incomingEdge = this.getEdgeInto(rowIndex)?.[0];
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
        const { row, rowIndex } = getRowById<InputOnlyRowT>(this.node, rowId);
        const outputVars: string[] = [];
        const incomingEdges = this.getEdgeInto(rowIndex) || [];

        for (let i = 0; i < row.connectedOutputs.length; i++)
        {
            const edge = incomingEdges[i];

            if (!edge) 
            {
                console.error(`Stacked edge not found but something is connected`);
                break;
            }

            outputVars.push(this.hashOutput(...edge.fromIndices));
        }

        return outputVars;
    }
}