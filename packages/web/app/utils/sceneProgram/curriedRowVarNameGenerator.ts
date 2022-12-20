import { getRowMetadata } from "../../components/GeometryRowRoot";
import { GeometryEdge, GNodeS, GNodeT, IncrementalProgramMetadata, InputOnlyRowT, GeometryJointLocation, ObjMap, ProgramConstant, ProgramTextureVar, ProgramTextureVarMapping, RowT, RowZ, TEXTURE_VAR_DATATYPE_SIZE } from "../../types";
import { Counter } from "../Counter";
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
        private node: GNodeS,
        private template: GNodeT,
        private textureCoordinateCounter: Counter,
        private incomingEdges?: ObjMap<GeometryEdge[]>,
    ) {}

    private createConstant(rowIndex: number, row: InputOnlyRowT)
    {
        const name = [ 'const_to', this.nodeIndex, rowIndex ].join('_');

        if (this.incrementalMeta.constants.find(t => t.name == name)) 
            return name;
            
        // does not exist => create
        
        const constant: ProgramConstant =
        {
            name,
            dataType: row.dataType,
            value: row.value,
        };
        this.incrementalMeta.constants.push(constant);
        
        return constant.name;
    }
    
    private createTextureVar(rowIndex: number, row: InputOnlyRowT)
    {
        const name = [ 'tex_to', this.nodeIndex, rowIndex ].join('_');

        if (this.incrementalMeta.textureVars.find(t => t.name == name)) 
            return name;

        // does not exist => create
        
        const size = TEXTURE_VAR_DATATYPE_SIZE[row.dataType];
        const textureCoordinate = this.textureCoordinateCounter.nextInts(size);

        const textureVar: ProgramTextureVar =
        {
            name, 
            dataType: row.dataType,
            textureCoordinate,
        };
        
        this.incrementalMeta.textureVars.push(textureVar);
        
        const textureVarMapping: ProgramTextureVarMapping = 
        {
            textureCoordinate: textureVar.textureCoordinate,
            dataTypes: textureVar.dataType,
            nodeIndex: this.nodeIndex,
            rowIndex,
        };
        const location: GeometryJointLocation =
        {
            nodeId: this.node.id,
            rowId: row.id,
            subIndex: 0,
        };
        const uniqueRowKey = jointLocationHash(location);
        this.incrementalMeta.textureVarMappings[uniqueRowKey] = textureVarMapping;

        return textureVar.name;
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

    private getRowZ<T extends RowT>(rowId: string)
    {
        const rowIndex = this.template.rows.findIndex(row => row.id === rowId);
        const rowT = this.template.rows[rowIndex];
        const rowS = this.node.rows[rowId];

        if (!rowT) return;

        // @ts-ignore
        const row: RowZ<T> = {
            ...rowT,
            ...rowS,
        };
        return { row, rowIndex };
    }

    input(varToken: string)
    {
        const varName = varToken.replace('$', '');

        // should be rowId
        const foundRow = this.getRowZ<InputOnlyRowT>(varName);
        if (!foundRow) return this.getLocalVarName(varName);

        const { row, rowIndex } = foundRow;

        // case 1: connection
        const incomingEdge = this.getEdgeInto(rowIndex)?.[0];
        if (incomingEdge) 
            return this.hashOutput(...incomingEdge.fromIndices);

        // case 2: fallback function argument
        if (row.defaultArgumentToken)
            return row.defaultArgumentToken;

        const rowMetadata = getRowMetadata({ state: row, template: row, numConnectedJoints: 0 });

        // case 3: parameter texture lookup
        if (rowMetadata.dynamicValue)
        {
            return this.createTextureVar(rowIndex, row);
        }

        // case 4: fixed constant
        return this.createConstant(rowIndex, row);
    }

    output(varToken: string)
    {
        const varName = varToken.replace('$', '');

        const foundRow = this.getRowZ<InputOnlyRowT>(varName);
        if (!foundRow) return this.getLocalVarName(varName);

        const { rowIndex } = foundRow;
        return this.hashOutput(this.nodeIndex, rowIndex);
    }

    stacked(varToken: string): string[]
    {
        const varName = varToken.replace('$', '');

        const foundRow = this.getRowZ<InputOnlyRowT>(varName);
        if (!foundRow) throw new Error(`Could not find row from operationOptions`);

        const { row, rowIndex } = foundRow;
        const outputVars: string[] = [];
        const incomingEdges = this.getEdgeInto(rowIndex) || [];

        for (let i = 0; i < row.incomingElements.length; i++)
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