import { AstNode, CompoundStatementNode, DeclarationNode, IdentifierNode, LiteralNode, Path, Program, TypeSpecifierNode } from "@shaderfrog/glsl-parser/ast";
import { getRowMetadata } from "../../components/GeometryRowRoot";
import { GeometryConnectionData, GeometryIncomingElementTypes, GeometryS, InputOnlyRowT, ProgramTextureVarMapping, RowS, RowTypes, SuperInputRowT, TEXTURE_VAR_DATATYPE_SIZE } from "../../types";
import { Counter } from "../Counter";
import { LOOKUP_TEXTURE_WIDTH } from "../viewportView/GLProgramRenderer";
import { formatLiteral, formatTextureLookupStatement } from "./generateCodeStatements";

enum Prefixes {
    Local = 'l',
    Dynamic = 'd',
    Edge = 'e',
}

interface StatementLocation
{
    functionIndex: number;
    statementIndex: number;
}

export default class IdentifierRenamer
{
    private geometry: GeometryS | null = null;
    private connectionData: GeometryConnectionData | null = null;
    private nodeIndex = -1;
    private definedLocals = new Set<string>();
    private additionalStatements: Array<{ 
        location: StatementLocation;
        node: LiteralNode;
    }> = [];
    private textureCoordinateCounter = new Counter(LOOKUP_TEXTURE_WIDTH * LOOKUP_TEXTURE_WIDTH);
    private textureVarMappings: ProgramTextureVarMapping[] = [];

    constructor() {}

    public setGeometry(geometry: GeometryS, connectionData: GeometryConnectionData) {
        this.geometry = geometry;
        this.connectionData = connectionData;
    }

    public setNode(nodeIndex: number) {
        this.nodeIndex = nodeIndex;
    }

    public getGeometry() {
        if (!this.geometry || !this.connectionData) {
            throw new Error(`Geometry not set in Renamer`);
        }
        return { geometry: this.geometry, connectionData: this.connectionData };
    }

    public getNode() {
        const { geometry, connectionData } = this.getGeometry();
        const node = geometry.nodes[this.nodeIndex];
        const nodeData = connectionData.nodeDatas[this.nodeIndex];
        if (!node || !nodeData) {
            throw new Error(`Node not set in Renamer`);
        }
        return { node, nodeData };
    }

    public addAdditionalStatements(astRoot: Program) {

        while (this.additionalStatements.length) {
            // loop over statements in reverse over by popping
            const { location, node } = this.additionalStatements.pop()!;

            const functionNode = astRoot.program[location.functionIndex];
            if (functionNode.type !== 'function') {
                throw new Error(`Not a function`);
            }

            const compound: CompoundStatementNode = functionNode.body;

            // insert into array before index
            compound.statements = [
                ...compound.statements.slice(0, location.statementIndex),
                node,
                ...compound.statements.slice(location.statementIndex),
            ]
        }
    }

    public getTextureVarMappings() {
        return this.textureVarMappings;
    }

    private getIdentifierName(prefix: string, ...data: (number | string)[]) {
        return [ prefix, ...data ].join('_');
    }
    
    private getIncomingEdge(nodeIndex: number, rowIndex: number)
    {
        const { connectionData } = this.getGeometry();
        return connectionData.backwardEdges[nodeIndex]?.[rowIndex] || [];
    }

    private getStatementLocation(path: Path<AstNode>): StatementLocation {

        let currPath: Path<AstNode> = path;
        while (currPath.node.type !== 'declaration_statement') {
            if (!currPath.parentPath) {
                throw new Error("No declaration_statement found");
            }
            currPath = currPath.parentPath;
        }
        const statementIndex = currPath.index!;

        while (currPath.node.type !== 'function') {
            if (!currPath.parentPath) {
                throw new Error("No function found");
            }
            currPath = currPath.parentPath;
        }
        const functionIndex = currPath.index!;

        return { statementIndex, functionIndex };
    }

    private addDeclarationInfront(path: Path<AstNode>, code: string) {
        const location = this.getStatementLocation(path);
        this.additionalStatements.push({
            location,
            node: { type: 'literal', literal: code, whitespace: '\n    ' }
        });
    }

    public replaceReference(path: Path<IdentifierNode>): void
    {
        const { geometry } = this.getGeometry();
        const { node, nodeData } = this.getNode();
        const token = path.node.identifier;
        const rowIndex = nodeData.template.rows.findIndex(row => row.id === token);

        // case 0: no row, read local 
        if (rowIndex < 0) {
            const newId = this.getIdentifierName(Prefixes.Local, this.nodeIndex, token);
            if (!this.definedLocals.has(newId)) {
                throw new Error(`Variable "${newId}" (originaly "${token}") is not defined.`);
            }
            path.node.identifier = newId;
            return;
        } 

        const rowTemp = nodeData.template.rows[rowIndex];
        const rowTempAsInput = rowTemp as SuperInputRowT;
        const rowState = node.rows[rowTemp.id];

        // case 1: connection
        const incomingEdges = this.getIncomingEdge(this.nodeIndex, rowIndex);

        // 1.1 stacked input
        if (rowTemp.type === RowTypes.InputStacked) {
            const parentType = path.parent?.type;
            if (parentType !== 'function_call') {
                throw new Error(`Stacked row identifier must be argument of function call`);
            }
            const [ defaultLiteralTree ] = path.parent.args;
            const functionName = (path.parent.identifier as any)?.specifier?.identifier;
            if (functionName == null) {
                throw new Error(`Function name null`);
            }
            const size = Object.keys(incomingEdges).length;
            if (size === 0) {
                const anyParent = path.parent as any;
                for (const key in path.parent){
                    delete anyParent[key];
                }
                Object.assign(anyParent, defaultLiteralTree);
                return;
            }
            // create stacked input
            let expr = '';
            for (let i = 0; i < size; i++) {
                const jointEdge = incomingEdges[i];
                const identifier = this.getIdentifierName(Prefixes.Edge, ...jointEdge.fromIndices);
                if (i == 0) {
                    expr = identifier;
                } else {
                    expr = `${functionName}(${expr},${identifier})`;
                }
            }
            const identifierNode: IdentifierNode = {
                type: 'identifier',
                identifier: expr,
                whitespace: '',
            };
            const anyParent = path.parent as any;
            for (const key in path.parent){
                delete anyParent[key];
            }
            Object.assign(anyParent, identifierNode);
            return;
        }

        // 1.2 single incoming edge
        if (incomingEdges[0] != null) {
            const jointEdge = incomingEdges[0];
            path.node.identifier = this.getIdentifierName(Prefixes.Edge, ...jointEdge.fromIndices);
            return;
        }

        // case 2.1: argument connected
        const incomingArg = rowState?.incomingElements?.[0];
        if (incomingArg?.type === GeometryIncomingElementTypes.Argument) {
            path.node.identifier = incomingArg.argument.id;
            return;
        }
        
        // case 2.2 argument fallback
        if (rowTempAsInput.defaultArgumentToken != null) {
            path.node.identifier = rowTempAsInput.defaultArgumentToken;
            return;
        }

        const rowMetadata = getRowMetadata({ state: rowState, template: rowTemp, numConnectedJoints: 0 });

        // case 3: parameter texture lookup
        if (rowMetadata.dynamicValue) {
            const dynamicId = this.getIdentifierName(Prefixes.Dynamic, this.nodeIndex, rowIndex);
            path.node.identifier = dynamicId;
            if (!this.definedLocals.has(dynamicId)) {
                this.definedLocals.add(dynamicId);
                // DECLARATION
                const size = TEXTURE_VAR_DATATYPE_SIZE[rowTempAsInput.dataType];
                const textureCoordinate = this.textureCoordinateCounter.nextInts(size);
                const textureLookupCode = formatTextureLookupStatement(dynamicId, textureCoordinate, rowTempAsInput.dataType);
                this.addDeclarationInfront(path, textureLookupCode);
                // VAR MAPPING
                this.textureVarMappings.push({
                    dataType: rowTempAsInput.dataType,
                    textureCoordinate,
                    geometryId: geometry.id,
                    geometryVersion: geometry.version,
                    nodeIndex: this.nodeIndex,
                    rowIndex,
                });
            }
            return;
        }

        // case 4: fixed constant
        const value = (rowState as RowS<InputOnlyRowT>).value ?? rowTempAsInput.value;
        const valueLitteral = formatLiteral(value, rowTempAsInput.dataType);
        path.node.identifier = valueLitteral;
        return;
    }

    public replaceDeclaration(path: Path<DeclarationNode>)
    {
        const { node, nodeData } = this.getNode();
        const token = path.node.identifier.identifier;
        const rowIndex = nodeData.template.rows.findIndex(row => row.id === token);
        const idntNode = path.node.identifier;
        
        if (rowIndex < 0) // no row, declare local 
        {
            const newId = this.getIdentifierName(Prefixes.Local, this.nodeIndex, token);
            if (this.definedLocals.has(newId)) {
                throw new Error(`Variable "${newId}" (originaly "${token}") has already been defined.`);
            }
            this.definedLocals.add(newId);
            idntNode.identifier = newId;
            return;
        } 

        // generate name for edge
        idntNode.identifier = this.getIdentifierName(Prefixes.Edge, this.nodeIndex, rowIndex);
    }
}