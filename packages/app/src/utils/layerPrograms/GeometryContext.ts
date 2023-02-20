import { ExpressionNode } from '@marble/language';
import { getRowMetadata } from '../../components/GeometryRowRoot';
import { BaseInputRowT, DataTypes, decomposeTemplateId, GeometryConnectionData, GeometryS, RowS, RowTypes, textureVarDatatypeSize } from "../../types";
import analyzeGraph from '../analyzeBasicGraph';
import geometryNodesToGraphAdjacency from "../geometries/geometryNodesToGraphAdjacency";
import { parseValue } from './generateCodeStatements';

interface EdgeLinkingRule {
    type: 'edge';
    identifier: string;
}
interface ExpressionLinkingRule {
    type: 'expression';
    identifier: string;
    expression: ExpressionNode;
}
interface LookupLinkingRule {
    type: 'lookup';
    identifier: string;
    dataSize: number;
    rowDataType: DataTypes;
    rowIndex: number;
}
type LinkingRule = EdgeLinkingRule | ExpressionLinkingRule | LookupLinkingRule;

export class GeometryContext {

    public active = -1;

    constructor(
        public geometry: GeometryS,
        public connectionData: GeometryConnectionData
    ) {}

    public select(index: number) {
        this.active = index;
    }

    get activeNodeState() {
        const state = this.geometry.nodes[this.active];
        if (!state) {
            throw new Error(`No node state found for index "${this.active}"`);
        }
        return state;
    }

    get activeNodeData() {
        const data = this.connectionData.nodeDatas[this.active];
        if (!data) {
            throw new Error(`No node data found for index "${this.active}"`);
        }
        return data;
    }

    public sortUsedNodeIndices() {
        const { geometry, connectionData } = this;
        const n = geometry.nodes.length;
        const nodeAdjacency = geometryNodesToGraphAdjacency(n, connectionData.forwardEdges);
        const graphAnalysis = analyzeGraph(n, nodeAdjacency);
        const { topologicalSorting, cycles, components } = graphAnalysis;

        if (cycles.length) {
            throw new Error(`Cyclic nodes found while compiling geometry.`);
        }

        // find lowest index where a node is output
        let outputIndex = -1;
        for (let i = geometry.nodes.length - 1; i >= 0; i--) {
            const { id: templateIdentifier, type: templateType } = decomposeTemplateId(geometry.nodes[i].templateId);
            if (geometry.id === templateIdentifier && templateType === 'output') {
                outputIndex = i;
                break;
            }
        }
        if (outputIndex < 0) {
            return []; // no output
        }
        const outputComponent = components[outputIndex];
        const usedOrderedNodeIndices = topologicalSorting
            .filter(nodeIndex => components[nodeIndex] == outputComponent);
        return usedOrderedNodeIndices;
    }

    public getRowLinkingRule(rowId: string): LinkingRule {
        const {
            connectionData, active: nodeIndex, activeNodeState: state, activeNodeData: { template },
        } = this;
        const rowIndex = template.rows.findIndex(row => row.id === rowId);
        if (rowIndex < 0) {
            throw new Error(`Row "${rowId}" does not exists on template`);
        }
        const rowTemp = template.rows[rowIndex] as BaseInputRowT<DataTypes, RowTypes>;
        if (!rowTemp.dataType) {
            throw new Error(`Must be input row`);
        }
        const rowState = state.rows[rowTemp.id];

        // case 1: connection
        const incomingEdges = connectionData.backwardEdges[nodeIndex]?.[rowIndex] || [];

        // // 1.1 stacked input
        // if (rowTemp.type === 'input_stacked') {
        //     const parentType = path.parent?.type;
        //     if (parentType !== 'function_call') {
        //         throw new Error(`Stacked row identifier must be argument of function call`);
        //     }
        //     const [defaultLiteralTree] = path.parent.args;
        //     const functionName = (path.parent.identifier as any)?.specifier?.identifier;
        //     if (functionName == null) {
        //         throw new Error(`Function name null`);
        //     }
        //     const size = Object.keys(incomingEdges).length;
        //     if (size === 0) {
        //         const anyParent = path.parent as any;
        //         for (const key in path.parent) {
        //             delete anyParent[key];
        //         }
        //         Object.assign(anyParent, defaultLiteralTree);
        //         return;
        //     }
        //     // create stacked input
        //     let expr = '';
        //     for (let i = 0; i < size; i++) {
        //         const jointEdge = incomingEdges[i];
        //         const identifier = getIdentifierName(Prefixes.Edge, ...jointEdge.fromIndices);
        //         if (i == 0) {
        //             expr = identifier;
        //         } else {
        //             expr = `${functionName}(${expr},${identifier})`;
        //         }
        //     }
        //     const identifierNode: IdentifierNode = {
        //         type: 'identifier',
        //         identifier: expr,
        //         whitespace: '',
        //     };
        //     const anyParent = path.parent as any;
        //     for (const key in path.parent) {
        //         delete anyParent[key];
        //     }
        //     Object.assign(anyParent, identifierNode);
        //     return;
        // }
        // 1.2 single incoming edge
        if (incomingEdges[0] != null) {
            const jointEdge = incomingEdges[0];
            const outputIndex = jointEdge.fromIndices[0];
            const identifier = GeometryContext.getIdentifierName('output', outputIndex);
            return {
                type: 'edge',
                identifier,
            };
        }

        // // case 2.1: argument connected
        // const incomingArg = rowState?.incomingElements?.[0];
        // if (incomingArg?.type === 'argument') {
        //     path.node.identifier = incomingArg.argument;
        //     return;
        // }
        // // case 2.2 argument fallback
        // if (rowTemp.defaultArgumentToken != null) {
        //     path.node.identifier = rowTemp.defaultArgumentToken;
        //     return;
        // }
        const rowMetadata = getRowMetadata({
            state: rowState,
            template: rowTemp as BaseInputRowT,
            numConnectedJoints: 0
        });

        // case 3: parameter texture lookup
        if (rowMetadata.dynamicValue) {
            const dataSize = textureVarDatatypeSize[rowTemp.dataType];
            if (dataSize <= 0) {
                throw new Error(`cannot lookup dataType ${rowTemp.dataType}`);
            }
            return {
                type: 'lookup',
                identifier: GeometryContext.getIdentifierName('local', nodeIndex, rowId),
                rowDataType: rowTemp.dataType,
                dataSize,
                rowIndex,
            };
        }

        // case 4: fixed constant
        const value = (rowState as RowS<BaseInputRowT>)?.value ?? rowTemp.value;
        const identifier = GeometryContext.getIdentifierName('local', nodeIndex, rowId);
        const expression = parseValue(rowTemp.dataType, value);
        return {
            type: 'expression',
            identifier,
            expression,
        };
    }

    public static getIdentifierName(
        prefixTypes: 'geometry' | 'output' | 'local' | 'lambda_arg',
        ...descriptors: (string | number)[]
    ) {
        const prefixes = {
            'geometry': 'geo_',
            'output': 'out_',
            'local': '_',
            'lambda_arg': 'arg_',
        };
        return prefixes[prefixTypes] + descriptors.join('_');
    }
}
