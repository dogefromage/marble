import { DeclarationNode, IdentifierNode, Path } from "@shaderfrog/glsl-parser/ast";
import { getRowMetadata } from "../../components/GeometryRowRoot";
import { GeometryConnectionData, GeometryIncomingElementTypes, GeometryS, SuperInputRowT } from "../../types";
import { SceneCompilationError } from "./SceneCompiler";

export default class IdentifierRenamer
{
    private nodeIndex = -1;

    constructor(
        private geometry: GeometryS, 
        private connectionData: GeometryConnectionData) 
    {}

    public setScope(nodeIndex: number) {
        this.nodeIndex = nodeIndex;
    }

    public getScope() {
        const node = this.geometry.nodes[this.nodeIndex];
        const template = this.connectionData.nodeTemplates[this.nodeIndex];

        if (!node || !template) {
            throw new SceneCompilationError(`No node found at index ${this.nodeIndex}`);
        }

        return { node, template };
    }


    // private createConstant(rowIndex: number, row: InputOnlyRowT)
    // {
    //     const name = [ 'const_to', this.nodeIndex, rowIndex ].join('_');

    //     if (this.incrementalMeta.constants.find(t => t.name == name)) 
    //         return name;
            
    //     // does not exist => create
        
    //     const constant: ProgramConstant =
    //     {
    //         name,
    //         dataType: row.dataType,
    //         value: row.value,
    //     };
    //     this.incrementalMeta.constants.push(constant);
        
    //     return constant.name;
    // }
    
    // private createTextureVar(rowIndex: number, row: InputOnlyRowT)
    // {
    //     const name = [ 'tex_to', this.nodeIndex, rowIndex ].join('_');

    //     if (this.incrementalMeta.textureVars.find(t => t.name == name)) 
    //         return name;

    //     // does not exist => create
        
    //     const size = TEXTURE_VAR_DATATYPE_SIZE[row.dataType];
    //     const textureCoordinate = this.textureCoordinateCounter.nextInts(size);

    //     const textureVar: ProgramTextureVar =
    //     {
    //         name, 
    //         dataType: row.dataType,
    //         textureCoordinate,
    //     };
        
    //     this.incrementalMeta.textureVars.push(textureVar);
        
    //     const textureVarMapping: ProgramTextureVarMapping = 
    //     {
    //         textureCoordinate: textureVar.textureCoordinate,
    //         dataTypes: textureVar.dataType,
    //         nodeIndex: this.nodeIndex,
    //         rowIndex,
    //     };
    //     const location: GeometryJointLocation =
    //     {
    //         nodeId: this.node.id,
    //         rowId: row.id,
    //         subIndex: 0,
    //     };
    //     const uniqueRowKey = jointLocationHash(location);
    //     this.incrementalMeta.textureVarMappings[uniqueRowKey] = textureVarMapping;

    //     return textureVar.name;
    // }

    private nameOutput(nodeIndex: number, rowIndex: number) {
        return `e_${nodeIndex}_${rowIndex}`;
    }

    private nameLocal(name: string) {
        return `l_${this.nodeIndex}_${name}`;
    }

    private getIncomingEdge(nodeIndex: number, rowIndex: number)
    {
        return this.connectionData.backwardEdges[nodeIndex]?.[rowIndex];
    }

    // private getLocalVarName(varName: string)
    // {
    //     return `temp_${this.node.id}_${varName}`;
    // }

    replaceReference(path: Path<IdentifierNode>): void
    {
        const { node, template } = this.getScope();
        const token = path.node.identifier;
        const rowIndex = template.rows.findIndex(row => row.id === token);

        // case 0: no row, read local 
        if (rowIndex < 0) { // 
            path.node.identifier = this.nameLocal(token);
            return;
        } 

        const rowTemp = template.rows[rowIndex];
        const rowTempAsInput = rowTemp as SuperInputRowT;
        const rowState = node.rows[rowTemp.id];

        // case 1: connection
        const incomingEdge = this.getIncomingEdge(this.nodeIndex, rowIndex)?.[0];

        if (incomingEdge) {
            path.node.identifier = this.nameOutput(...incomingEdge.fromIndices);
            return;
        }

        // case 2.1: argument connected
        const incomingArg = rowState.incomingElements?.[0];
        if (incomingArg?.type === GeometryIncomingElementTypes.Argument) {
            path.node.identifier = incomingArg.argument.token;
            return;
        }
        
        // case 2.2 argument fallback
        if (rowTempAsInput.defaultArgumentToken != null) {
            path.node.identifier = rowTempAsInput.defaultArgumentToken;
            return;
        }

        const rowMetadata = getRowMetadata({ state: rowState, template: rowTemp, numConnectedJoints: 0 });

        // case 3: parameter texture lookup
        // if (rowMetadata.dynamicValue) {
        //     return this.createTextureVar(rowIndex, row);
        // }

        // // case 4: fixed constant
        // return this.createConstant(rowIndex, row);
    }

    replaceDeclaration(path: Path<DeclarationNode>)
    {
        const { node, template } = this.getScope();
        const token = path.node.identifier.identifier;
        const rowIndex = template.rows.findIndex(row => row.id === token);
        const idntNode = path.node.identifier;
        
        if (rowIndex < 0) // no row, declare local 
        {
            idntNode.identifier = this.nameLocal(token);
            return;
        } 

        // generate name for edge
        idntNode.identifier = this.nameOutput(this.nodeIndex, rowIndex);
    }

    // stacked(varToken: string): string[]
    // {
    //     const varName = varToken.replace('$', '');

    //     const foundRow = this.getRowZ<InputOnlyRowT>(varName);
    //     if (!foundRow) throw new Error(`Could not find row from operationOptions`);

    //     const { row, rowIndex } = foundRow;
    //     const outputVars: string[] = [];
    //     const incomingEdges = this.getEdgeInto(rowIndex) || [];

    //     for (let i = 0; i < row.incomingElements.length; i++)
    //     {
    //         const edge = incomingEdges[i];

    //         if (!edge) 
    //         {
    //             console.error(`Stacked edge not found but something is connected`);
    //             break;
    //         }

    //         outputVars.push(this.hashOutput(...edge.fromIndices));
    //     }

    //     return outputVars;
    // }
}