import { getRowMetadata } from "../../components/GeometryRowRoot";
import { GNodeZ, InputOnlyRowT, JointLocation, ObjMap, OutputRowT, IncrementalProgramMetadata, ProgramConstant, ProgramTextureVar, ProgramTextureVarMapping, TEXTURE_VAR_DATATYPE_SIZE } from "../../types";
import { Counter } from "../Counter";
import { GeometryEdge } from "../geometries/generateAdjacencyLists";
import { getRowById } from "../geometries/getRows";
import { jointLocationHash } from "../geometries/locationHashes";

function createIncrementalMeta()
{
    const d: IncrementalProgramMetadata = {
        constants: [],
        textureVars: [],
        textureVarMappings: {},
    }
    return d;
}

export class RowVarNameGenerator
{
    private incrementalMeta = createIncrementalMeta();

    constructor(
        private nodeIndex: number,
        private node: GNodeZ,
        private textureCoordinateCounter: Counter,
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

    private getLocalVarName(varName: string)
    {
        return `temp_${this.node.id}_${varName}`;
    }

    input(varToken: string)
    {
        const varName = varToken.replace('$', '');

        // should be rowId
        const foundRow = getRowById<InputOnlyRowT>(this.node, varName);
        if (!foundRow) return this.getLocalVarName(varName);

        const { row, rowIndex } = foundRow;

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
            this.incrementalMeta.textureVars.push(textureVar);

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
            this.incrementalMeta.textureVarMappings[uniqueRowKey] = textureVarMapping;

            return textureVar.name;
        }

        // case 4: fixed constant
        const constant = this.createConstant(rowIndex, row);
        this.incrementalMeta.constants.push(constant);
        return constant.name;
    }

    output(varToken: string)
    {
        const varName = varToken.replace('$', '');

        const foundRow = getRowById<InputOnlyRowT>(this.node, varName);
        if (!foundRow) return this.getLocalVarName(varName);

        const { rowIndex } = foundRow;
        return this.hashOutput(this.nodeIndex, rowIndex);
    }

    stacked(varToken: string): string[]
    {
        const varName = varToken.replace('$', '');

        const foundRow = getRowById<InputOnlyRowT>(this.node, varName);
        if (!foundRow) throw new Error(`Could not find row from operationOptions`);

        const { row, rowIndex } = foundRow;
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

    popIncrementalMetadata()
    {
        const meta = this.incrementalMeta;
        this.incrementalMeta = createIncrementalMeta();
        return meta;
    }
}