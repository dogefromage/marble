import { generate } from '@shaderfrog/glsl-parser';
import { AstNode, CompoundStatementNode, FunctionNode, LiteralNode, Program, visit } from "@shaderfrog/glsl-parser/ast";
import { parse } from '@shaderfrog/glsl-parser/parser/parser';
import produce from 'immer';
import { prefixGeometryFunction } from '.';
import { decomposeTemplateId, DependencyGraph, GeometryConnectionData, GeometryS, GeometrySignature, getDependencyKey, Layer, LayerProgram, ObjMapUndef, ProgramInclude, splitDependencyKey } from "../../types";
import analyzeGraph from '../analyzeBasicGraph';
import topSortDependencies from '../dependencyGraph/topSortDependencies';
import geometryNodesToGraphAdjacency from "../geometries/geometryNodesToGraphAdjacency";
import GeometryFunctionGenerator from "./FunctionNodeGenerator";

export default class ProgramCompiler {
    public compileErrorMessages = new Map<string, string>();

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
            this.compileErrorMessages.set(layer.id, `Not all dependencies of this layer are met`);
            return null;
        }
        const topSortAll = topSortDependencies(rootLayerKey, dependencyGraph);
        if (!topSortAll) {
            this.compileErrorMessages.set(layer.id, `Topological sorting not possible`)
            return null;
        }

        const topologicalGeometrySorting = topSortAll
            .filter(key => splitDependencyKey(key).type === 'geometry')
            .map(key => splitDependencyKey(key).id);

        const geometryFunctionNodes: FunctionNode[] = [];

        for (const geoId of topologicalGeometrySorting) {
            const geoOrderEl = dependencyGraph.order.get(getDependencyKey(geoId, 'geometry'))!;
            const geo = geometries[ geoId ];
            const data = geometryDatas[ geoId ];
            if (!geo || !data || geo.version != geoOrderEl.version || geo.version != data.geometryVersion) {
                this.compileErrorMessages.set(layer.id, `Data version missaligned`);
                return null;
            }
            const functionNode = this.generateGeometryFunction(geo, data);
            if (functionNode != null) {
                geometryFunctionNodes.push(functionNode);
            }
        }

        const programAst: Program = {
            type: 'program',
            program: geometryFunctionNodes,
            scopes: [],
        }

        const generatedCode = generate(programAst);
        console.info({ generatedCode });

        // // get necessary geometries and datas in right order
        // const geoList: GeometryS[] = [];
        // const dataList: GeometryConnectionData[] = [];
        // for (let geoIndex = 0; geoIndex < topSortedGeos.length; geoIndex++) {
        //     const geoId = topSortedGeos[ geoIndex ];
        //     const geoOrderEl = dependencyGraph.order.get(getDependencyKey(geoId, 'geometry'))!;
        //     const geo = geometries[ geoId ];
        //     const data = geometryDatas[ geoId ];
        //     if (!geo || !data || geo.version != geoOrderEl.version || geo.version != data.geometryVersion) {
        //         this.compileErrorMessages.set(layer.id, `Data version missaligned`);
        //         return null;
        //     }

        //     geoList.push(geo);
        //     dataList.push(data);
        //     // generate code for geometry
        //     const geometryCode = this.generateGeometryFunction(geo, data);
        //     if (geometryCode == null) continue;

        //     const marker = `# geometry ${geoIndex};`;
        //     geometryFunctionBlocks.push(marker, geometryCode.functionBlock);

        //     if (geoIndex == topSortedGeos.length - 1) {
        //         rootFunctionName = geometryCode.functionName;
        //     }
        // }

            // const source = geometryFunctionBlocks.join(`\n`);
            // // console.info(source);

            // const structures = new Set<string>();

            // // PREPROCESSING
            // let preprocessedSource = source;
            // preprocessedSource = preprocessSource(
            //     preprocessedSource, /#REDUCE\(/i,
            //     ({ source, index, length }) => {
            //         const closingBracketIndex = findClosingBracket(source, index + length - 1);
            //         if (closingBracketIndex <= 0) {
            //             throw new Error("No closing bracket found for makro REDUCE");
            //         }
            //         const fullExpression = source.substring(index, closingBracketIndex + 1);
            //         const argsSubString = source.substring(index + length, closingBracketIndex);
            //         const args = splitBracketSafe(argsSubString, ',').map(s => s.trim());
            //         if (args.length != 3) {
            //             throw new Error("REDUCE makro takes in 3 arguments");
            //         }
            //         const [ func, stackedVar, defaultLiteral ] = args;
            //         const stackedExpression = generateStackedExpression(func, stackedVar, defaultLiteral);
            //         return source.replace(fullExpression, stackedExpression)
            //     }
            // );
            // preprocessedSource = preprocessSource(
            //     preprocessedSource, /TuplePlaceholder<[\w\s,]+>/i,
            //     ({ source, index, length }) => {
            //         const substring = source.substring(index, index + length);
            //         const inner = substring.match(/<(.+)>/)?.[1]!;
            //         const typeList = inner.split(',').map(s => s.trim());
            //         const structureKey = typeList.join('.');
            //         structures.add(structureKey);
            //         const identifier = generateStructureIdentifier(typeList);
            //         return source.replaceAll(substring, identifier);
            //     }
            // )

            // const structureDefinitions = [ ...structures ]
            //     .map(struct => generateStructureDefinition(struct.split('.')));
            // const structureDefinitionsBlock = structureDefinitions.join('\n');
            // // add structures
            // preprocessedSource = structureDefinitionsBlock + '\n\n' + preprocessedSource;
            // // console.info(preprocessedSource);

            // // parse source
            // let programAst: Program;
            // try {
            //     programAst = parser.parse(preprocessedSource, { quiet: true });
            // } catch (e: any) {
            //     throw new Error(e.message);
            // }

            // const renamer = new IdentifierRenamer({ textureVarRowIndex });
            // const usedIncludes = new Set<string>();

            // const visitors: NodeVisitors = {
            //     preprocessor: {
            //         enter: path => {
            //             const pre = path.node.line;
            //             // # geometry ...
            //             const matchGeo = pre.match(/#\s*geometry\s+(\w+);/i);
            //             if (matchGeo != null) {
            //                 const geometryIndex = Number(matchGeo[ 1 ]);
            //                 const geo = geoList[ geometryIndex ];
            //                 const data = dataList[ geometryIndex ];
            //                 renamer.setGeometryScope(geo, data);
            //                 path.remove();
            //             }
            //             // # node ....
            //             const matchNode = pre.match(/#\s*node\s+(\w+);/i);
            //             if (matchNode != null) {
            //                 const nodeIndex = Number(matchNode[ 1 ]);
            //                 renamer.setNodeScope(nodeIndex);
            //                 path.remove();
            //             }
            //             // # include ....
            //             const matchIncludes = pre.match(/#\s*include\s+(\w+(?:\s*,\s*\w+)*)\s*;/i);
            //             if (matchIncludes != null) {
            //                 const includesRaw = matchIncludes[ 1 ]!;
            //                 const includes = includesRaw.split(',').map(s => s.trim());
            //                 for (const include of includes) {
            //                     usedIncludes.add(include);
            //                 }
            //                 path.remove();
            //             }
            //         }
            //     },
            //     declaration: {
            //         enter: path => { renamer.replaceDeclaration(path) }
            //     },
            //     identifier: {
            //         enter: (path) => {
            //             const parentType = path.parent!.type;
            //             const isDirectInitializer = parentType === 'declaration' && path.key === 'initializer';
            //             const isOtherReference = [ 'binary', 'function_call', 'postfix', 'return_statement' ].includes(parentType);
            //             if (isDirectInitializer || isOtherReference) {
            //                 renamer.replaceReference(path);
            //             }
            //         }
            //     }
            // }

            // visit(programAst, visitors);
            // renamer.addAdditionalStatements(programAst);

            // const textureVarMappings = renamer.getTextureVarMappings();
            // const emptyRow = new Array(LOOKUP_TEXTURE_WIDTH).fill(0);
            // const textureVarRow = mapDynamicValues(textureVarMappings, emptyRow, geometries, geometryDatas, true)!;

            const usedIncludes = new Set<string>(); // TODO
            const usedIncludesArr = [ ...usedIncludes ].map(incId => {
                const inc = includes[ incId ];
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

    private generateGeometryFunction(
            geometry: GeometryS, 
            connectionData: GeometryConnectionData,
        ): FunctionNode | null {

        if (geometry.outputs.length === 0) {
            return null;
        }

        const n = geometry.nodes.length;
        const nodeAdjacency = geometryNodesToGraphAdjacency(n, connectionData.forwardEdges);
        const graph = analyzeGraph(n, nodeAdjacency);
        const { topologicalSorting, cycles, components } = graph;

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
            .filter(nodeIndex => components[ nodeIndex ] == outputComponent);

        const signature: GeometrySignature = {
            name: geometry.name,
            inputs: geometry.inputs,
            outputs: geometry.outputs,
            isRoot: geometry.isRoot,
        };
        const generator = new GeometryFunctionGenerator(geometry, connectionData, signature);

        for (const nodeIndex of usedOrderedNodeIndices) {
            const nodeState = geometry.nodes[nodeIndex];
            const nodeData = connectionData.nodeDatas[nodeIndex];
            if (!nodeData) {
                throw new Error(`A required template is missing.`);
            }
            const nodeTemplate = nodeData.template;
            generator.processNode({ 
                index: nodeIndex,
                state: nodeState, 
                template: nodeTemplate 
            });
        }

        const functionName = prefixGeometryFunction(geometry.id);
        const functionNode = generator.generateFunctionNode();

        return functionNode;

        // // find lowest index where a node is output
        // let outputIndex = -1;
        // for (let i = geometry.nodes.length - 1; i >= 0; i--) {
        //     const { id: templateIdentifier, type: templateType } = decomposeTemplateId(geometry.nodes[i].templateId);
        //     if (geometry.id === templateIdentifier && templateType === 'output') {
        //         outputIndex = i;
        //         break;
        //     }
        // }
        // if (outputIndex < 0) {
        //     throw new Error(`Geometry does not have an output.`);
        // }
        // const outputComponent = components[outputIndex];

        // const instructions: string[] = [];

        // for (const nodeIndex of topologicalSorting) {
        //     // check if node is in same component as output
        //     const isUsed = true;
        //     // const isUsed = components[ nodeIndex ] == outputComponent;
        //     const nodeData = connectionData.nodeDatas[nodeIndex];
        //     if (isUsed && nodeData != null) {
        //         const marker = `    # node ${nodeIndex};`;
        //         const instructionBlock = setBlockIndent(nodeData.template.instructions!, 4);
        //         instructions.push(marker, instructionBlock);
        //     }
        // }

        // const functionName = prefixGeometryFunction(geometry.id);
        // const functionArgString = geometry.inputs
        //     .map(arg => `${arg.dataType} ${arg.id}`)
        //     .join(', ');

        // const returnType = createReturntypePlaceholder(geometry.outputs);

        // const functionHeader = `${returnType} ${functionName}(${functionArgString})`
        // const functionBody = instructions.join('\n');

        // return {
        //     functionName,
        //     functionBlock: `${functionHeader} {\n${functionBody}\n}\n`,
        // }
    }
}
