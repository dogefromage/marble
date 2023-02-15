import { generate } from '@shaderfrog/glsl-parser';
import { FunctionNode, Program } from "@shaderfrog/glsl-parser/ast";
import { parse } from '@marble/language';
import { decomposeTemplateId, DependencyGraph, GeometryConnectionData, GeometryS, getDependencyKey, GNodeState, GNodeTemplate, Layer, LayerProgram, ObjMapUndef, ProgramInclude, splitDependencyKey } from "../../types";
import analyzeGraph from '../analyzeBasicGraph';
import topSortDependencies from '../dependencyGraph/topSortDependencies';
import geometryNodesToGraphAdjacency from "../geometries/geometryNodesToGraphAdjacency";

export default class ProgramCompiler {

    public compileProgram(args: {
        layer: Layer,
        geometries: ObjMapUndef<GeometryS>,
        geometryDatas: ObjMapUndef<GeometryConnectionData>,
        dependencyGraph: DependencyGraph,
        includes: ObjMapUndef<ProgramInclude>,
        textureVarRowIndex: number,
    }): LayerProgram | null {
        const { layer, geometries, geometryDatas, dependencyGraph, includes, textureVarRowIndex } = args;

        const rootLayerKey = getDependencyKey(layer.id, 'layer');
        const rootOrder = dependencyGraph.order.get(rootLayerKey);
        if (rootOrder?.state !== 'met') {
            return null;
            // throw new Error(`Not all dependencies of this layer are met`);
        }
        const topSortAll = topSortDependencies(rootLayerKey, dependencyGraph);
        if (!topSortAll) {
            throw new Error(`Topological sorting not possible`);
        }
        const topologicalGeometrySorting = topSortAll
            .filter(key => splitDependencyKey(key).type === 'geometry')
            .map(key => splitDependencyKey(key).id);

        const geometryFunctionNodes: FunctionNode[] = [];

        for (const geoId of topologicalGeometrySorting) {
            const geoOrderEl = dependencyGraph.order.get(getDependencyKey(geoId, 'geometry'))!;
            const geo = geometries[geoId];
            const data = geometryDatas[geoId];

            if (!geo || !data || geo.version != geoOrderEl.version || geo.version != data.geometryVersion) {
                return null;
                // throw new Error(`Data version outdated or missing`);
            }

            const functionNode = this.generateGeometryGraph(geo, data);
        }

        const programAst: Program = {
            type: 'program',
            program: geometryFunctionNodes,
            scopes: [],
        }

        const generatedCode = generate(programAst);
        // console.info({ generatedCode });

        const usedIncludes = new Set<string>(); // TODO
        const usedIncludesArr = [...usedIncludes].map(incId => {
            const inc = includes[incId];
            if (!inc) {
                throw new Error(`Include ${incId} is missing!`);
            }
            return inc;
        });
        const layerOrderEl = dependencyGraph.order.get(rootLayerKey);
        const layerHash = layerOrderEl!.hash;

        const rootFunctionName = topologicalGeometrySorting.at(-1)!;

        return {
            id: layer.id,
            index: layer.index,
            name: layer.name,
            hash: layerHash,
            mainProgramCode: generatedCode,
            includes: usedIncludesArr,
            rootFunctionName,
            textureVarMappings: [], // TODO
            textureVarRowIndex,
            textureVarRow: [], // TODO
        }
    }

    private generateGeometryGraph(
        geometry: GeometryS,
        connectionData: GeometryConnectionData,
    ) {
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
            throw new Error(`Geometry does not have an output.`);
        }
        const outputComponent = components[outputIndex];

        const usedOrderedNodeIndices = topologicalSorting
            .filter(nodeIndex => components[nodeIndex] == outputComponent);

        const nodes: GraphNode[] = [];
        const edges = new Map<GraphNode, GraphNode[]>();

        for (const nodeIndex of usedOrderedNodeIndices) {
            const nodeState = geometry.nodes[nodeIndex];
            const nodeData = connectionData.nodeDatas[nodeIndex];
            if (!nodeData) {
                throw new Error(`A required template is missing.`);
            }

            // TODO cache
            const instructionAst = parse(nodeData.template.instructions);
            const func = instructionAst.program[0] as FunctionNode;
            if (func.type !== 'function') {
                throw new Error(`Template instructions must only contain a single method`);
            }

            const statements = func.body.statements;
            console.log(instructionAst);
            
            const node: GraphNode = {
                state: nodeState,
                template: nodeData.template,
            }
        }

        const graph: ReducedGeometryGraph = {
            nodes,
            edges,
        }
    }
}

interface GraphNode {
    state: GNodeState;
    template: GNodeTemplate;
}
    
type GraphEdge = never;

interface ReducedGeometryGraph {
    nodes: GraphNode[];
    edges: Map<GraphNode, GraphNode[]>;
}
