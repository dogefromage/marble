import { generate, parser } from '@shaderfrog/glsl-parser';
import { NodeVisitors, Program, visit } from "@shaderfrog/glsl-parser/ast";
import { OUTPUT_TEMPLATE_ID } from '../../content/defaultTemplates/outputTemplates';
import { DependencyGraph, DependencyNodeType, GeometryCompilerErrorTypes, GeometryConnectionData, GeometryS, GNodeTemplateTypes, Layer, LayerProgram, ObjMapUndef, ProgramInclude, SceneCompilerErrorInfo } from "../../types";
import { findClosingBracket, splitBracketSafe } from '../bracketedExpressions';
import topSortDependencies from '../dependencyGraph/topSortDependencies';
import analyzeGraph from '../graph/analyzeGraph';
import geometryNodesToGraphAdjacency from "../graph/geometryNodesToGraphAdjacency";
import getDependencyKey, { splitDependencyKey } from '../graph/getDependencyKey';
import { LOOKUP_TEXTURE_WIDTH } from '../viewport/GLProgramRenderer';
import { generateStackedExpression } from './generateCodeStatements';
import { GeometryCompilationException } from './GeometryCompilationException';
import IdentifierRenamer from "./IdentifierRenamer";
import preprocessSource from './preprocessSource';
import setBlockIndent from './setBlockIndent';

export default class ProgramCompiler 
{
    private errorInfos: SceneCompilerErrorInfo[] = [];
    // public getErrorInfos() { return this.errorInfos; }

    // public compileRenderLayer(geoMap: ObjMapUndef<GeometryS>)
    // {
    //     // this.errorInfos = []; // reset old

    //     // const geoList = Object.values(geoMap) as GeometryS[];

    //     // // detect changes
    //     // const validityList = geoList.map(g => g.version);
    //     // const hash = hashIntArray(validityList);
    //     // if (hash === this.compiledProgram?.hash)
    //     //     return; // no changes

    //     const dataList = geoList.map(geo => generateGeometryData(geo!, this.templates));

    //     // find topological sorting
    //     const numGeometries = geoList.length;
    //     // generate adjlist
    //     const geometriesAdjacency = new Array(numGeometries).fill(0).map<number[]>(_ => []);
        
    //     for (let u = 0; u < geoList.length; u++) {
    //         for (const dependency of dataList[u].dependencies) {
    //             const v = geoList.findIndex(g => g.id == dependency);

    //             if (v < 0) { // dependency was not found
    //                 const uId = geoList[u].id;
    //                 this.errorInfos.push({
    //                     type: GeometryCompilerErrorTypes.MissingDependency,
    //                     geometryId: uId,
    //                     dependency,
    //                 });
    //                 throw new GeometryCompilationError(`Geometries dependency with id ${dependency} not found.`);
    //             }

    //             // u depends on v <=> an edge (v,u) exists
    //             geometriesAdjacency[v].push(u);
    //         }
    //     }

    //     const programGraphData = analyzeGraph(numGeometries, geometriesAdjacency);

    //     // cycle error
    //     if (programGraphData.cycles.length > 0) {
    //         for (const cycle of programGraphData.cycles) {
    //             this.errorInfos.push({
    //                 type: GeometryCompilerErrorTypes.CyclicGeometryReferences,
    //                 geometryIds: cycle.map(index => geoList[index].id),
    //             })
    //         }
    //         throw new GeometryCompilationError(`Geometry dependencies form a cycle.`);
    //     }

    //     const { topOrder } = programGraphData;

    //     const geometryFunctionBlocks: string[] = [];

    //     for (const geometryIndex of topOrder) {
    //         const geo = geoList[geometryIndex];
    //         const data = dataList[geometryIndex];
    //         const functionBlock = this.generateGeometryFunction(geo, data);
    //         const marker = `# geometry ${geometryIndex};`;
    //         geometryFunctionBlocks.push(marker, functionBlock);
    //     }

    //     const source = geometryFunctionBlocks.join(`\n`);

    //     // parse source
    //     let programAst: Program;
    //     try {
    //         programAst = parser.parse(source, { quiet: true });
    //     } catch (e: any) {
    //         throw new GeometryCompilationError(e.message);
    //     }

    //     const renamer = new IdentifierRenamer();
    //     const usedIncludes = new Set<string>();

    //     const visitors: NodeVisitors = {
    //         preprocessor: {
    //             enter: path => 
    //             {
    //                 const pre = path.node.line;
    //                 // # geometry ...
    //                 const matchGeo = pre.match(/#\s*geometry\s+(\w+);/);
    //                 if (matchGeo != null) {
    //                     const geometryIndex = Number(matchGeo[1]);
    //                     const geo = geoList[geometryIndex];
    //                     const data = dataList[geometryIndex];
    //                     renamer.setGeometry(geo, data);
    //                     path.remove();
    //                 }
    //                 // # node ....
    //                 const matchNode = pre.match(/#\s*node\s+(\w+);/);
    //                 if (matchNode != null) {
    //                     const nodeIndex = Number(matchNode[1]);
    //                     renamer.setNode(nodeIndex);
    //                     path.remove();
    //                 }
    //                 // # include ....
    //                 const matchInclude = pre.match(/#\s*include\s+(\w+);/);
    //                 if (matchInclude != null) {
    //                     const include = matchInclude[1]!;
    //                     usedIncludes.add(include);
    //                 }
    //             }
    //         },
    //         declaration: {
    //             enter: path => { renamer.replaceDeclaration(path) }
    //         },
    //         identifier: {
    //             enter: (path) => {
    //                 const parentType = path.parent!.type;

    //                 const parentWhitelist: Array<typeof parentType> = 
    //                     [ 'binary', 'function_call', 'postfix', 'return_statement' ];
    //                 if (parentWhitelist.includes(parentType)) {
    //                     renamer.replaceReference(path);
    //                 }
    //             }
    //         }
    //     }

    //     visit(programAst, visitors);
    //     renamer.addAdditionalStatements(programAst); 

    //     const generatedCode = generate(programAst);
        
    //     const usedIncludesArr = [ ...usedIncludes ].map(incId =>
    //     {
    //         const inc = this.includes[incId];
    //         if (!inc) {
    //             throw new GeometryCompilationError(`Include ${incId} is missing!`);
    //         }
    //         return inc;
    //     });

    //     const program: LayerProgram = {
    //         id: 'test',
    //         name: '^lkjaslda',
    //         hash,
    //         mainProgramCode: generatedCode,
    //         includes: usedIncludesArr,
    //         rootFunctionName: 'hello',
    //         textureVarLookupData: new Array(LOOKUP_TEXTURE_SIZE * LOOKUP_TEXTURE_SIZE),
    //     }
    //     return program;
    // }

    public compileProgram(args: {
        layer: Layer,
        geometries: ObjMapUndef<GeometryS>, 
        geometryDatas: ObjMapUndef<GeometryConnectionData>, 
        dependencyGraph: DependencyGraph,
        includes: ObjMapUndef<ProgramInclude>,
    }): LayerProgram {
        const { layer, geometries, geometryDatas, dependencyGraph, includes } = args;

        const rootLayerKey = getDependencyKey(layer.id, DependencyNodeType.Layer);
        const topSortAll = topSortDependencies(rootLayerKey, dependencyGraph);
        if (!topSortAll) {
            throw new Error(`Topological sorting not possible`);
        }

        const topSort: string[] = [];
        for (const key of topSortAll) {
            const { type, id } = splitDependencyKey(key);
            if (type == DependencyNodeType.Geometry) {
                topSort.push(id);
            }
        }

        const geometryFunctionBlocks: string[] = [];

        let rootFunctionName = '';

        // get necessary geometries and datas in right order
        const geoList: GeometryS[] = [];
        const dataList: GeometryConnectionData[] = [];
        for (let geoIndex = 0; geoIndex < topSort.length; geoIndex++) {
            const geoId = topSort[geoIndex];
            const geoOrderEl = dependencyGraph.order.get(getDependencyKey(geoId, DependencyNodeType.Geometry))!;
            const geo = geometries[geoId];
            const data = geometryDatas[geoId];
            if (!geo || !data || geo.version != geoOrderEl.version || geo.version != data.geometryVersion) {
                throw new GeometryCompilationException("Data missaligned");
            }

            geoList.push(geo);
            dataList.push(data);
            // generate code for geometry
            const { functionName, functionBlock } = this.generateGeometryFunction(geo, data);
            const marker = `# geometry ${geoIndex};`;
            geometryFunctionBlocks.push(marker, functionBlock);

            if (geoIndex == topSort.length - 1) {
                rootFunctionName = functionName;
            }
        }

        const source = geometryFunctionBlocks.join(`\n`);
        // console.log(source);

        // PREPROCESSING
        const preprocessedSource = preprocessSource(
            source, /#REDUCE\(/i, 
            ({ source, index, length }) => {
                const closingBracketIndex = findClosingBracket(source, index + length - 1);
                if (closingBracketIndex <= 0) {
                    throw new Error("No closing bracket found for makro REDUCE");
                }
                const fullExpression = source.substring(index, closingBracketIndex + 1);
                const argsSubString = source.substring(index + length, closingBracketIndex);
                const args = splitBracketSafe(argsSubString, ',').map(s => s.trim());
                if (args.length != 3) {
                    throw new Error("REDUCE makro takes in 3 arguments");
                }
                const [ func, stackedVar, defaultLiteral ] = args;
                const stackedExpression = generateStackedExpression(func, stackedVar, defaultLiteral);
                return source.replace(fullExpression, stackedExpression)
            }
        );
        // console.log(preprocessedSource);

        // parse source
        let programAst: Program;
        try {
            programAst = parser.parse(preprocessedSource, { quiet: true });
        } catch (e: any) {
            throw new Error(e.message);
        }

        const renamer = new IdentifierRenamer();
        const usedIncludes = new Set<string>();

        const visitors: NodeVisitors = {
            preprocessor: {
                enter: path => 
                {
                    const pre = path.node.line;
                    // # geometry ...
                    const matchGeo = pre.match(/#\s*geometry\s+(\w+);/i);
                    if (matchGeo != null) {
                        const geometryIndex = Number(matchGeo[1]);
                        const geo = geoList[geometryIndex];
                        const data = dataList[geometryIndex];
                        renamer.setGeometry(geo, data);
                        path.remove();
                    }
                    // # node ....
                    const matchNode = pre.match(/#\s*node\s+(\w+);/i);
                    if (matchNode != null) {
                        const nodeIndex = Number(matchNode[1]);
                        renamer.setNode(nodeIndex);
                        path.remove();
                    }
                    // # include ....
                    const matchIncludes = pre.match(/#\s*include\s+(\w+(?:\s*,\s*\w+)*)\s*;/i);
                    if (matchIncludes != null) {
                        const includesRaw = matchIncludes[1]!;
                        const includes = includesRaw.split(',').map(s => s.trim());
                        for (const include of includes) {
                            usedIncludes.add(include);
                        }
                        path.remove();
                    }
                }
            },
            declaration: {
                enter: path => { renamer.replaceDeclaration(path) }
            },
            identifier: {
                enter: (path) => {
                    const parentType = path.parent!.type;

                    const parentWhitelist: Array<typeof parentType> = 
                        [ 'binary', 'function_call', 'postfix', 'return_statement' ];
                    if (parentWhitelist.includes(parentType)) {
                        renamer.replaceReference(path);
                    }
                }
            }
        }

        visit(programAst, visitors);
        renamer.addAdditionalStatements(programAst); 

        const generatedCode = generate(programAst);
        // console.log(generatedCode);
        
        const usedIncludesArr = [ ...usedIncludes ].map(incId =>
        {
            const inc = includes[incId];
            if (!inc) {
                throw new GeometryCompilationException(`Include ${incId} is missing!`);
            }
            return inc;
        });

        const layerOrderEl = dependencyGraph.order.get(rootLayerKey);
        const layerHash = layerOrderEl!.hash;

        return {
            id: layer.id,
            name: layer.name,
            hash: layerHash,
            mainProgramCode: generatedCode,
            includes: usedIncludesArr,
            rootFunctionName,
            textureVarLookupData: new Array(LOOKUP_TEXTURE_WIDTH * LOOKUP_TEXTURE_WIDTH),
        }
    }

    private generateGeometryFunction(
        geometry: GeometryS, 
        connectionData: GeometryConnectionData,
    ) {
        const n = geometry.nodes.length;
        const nodeAdjacency = geometryNodesToGraphAdjacency(n, connectionData.forwardEdges);
        const { topOrder, cycles, components } = analyzeGraph(n, nodeAdjacency);

        if (cycles.length) { // invalid because cycles
            for (const cycle of cycles) {
                this.errorInfos.push({
                    type: GeometryCompilerErrorTypes.CyclicNodes,
                    geometryId: geometry.id,
                    cyclicNodes: cycle,
                });
            }
            throw new GeometryCompilationException(`Geometry "${geometry.name}" has cyclic connected nodes.`);
        }
        
        // find lowest index where a node is output
        let outputIndex = -1;
        for (let i = geometry.nodes.length - 1; i >= 0; i--) {
            if (geometry.nodes[i].templateId === OUTPUT_TEMPLATE_ID) {
                outputIndex = i;
                break;
            }
        }
        if (outputIndex < 0) {
            this.errorInfos.push({
                type: GeometryCompilerErrorTypes.GeoOutputMissing,
                geometryId: geometry.id,
            });
            throw new GeometryCompilationException(`Geometry "${geometry.name}" does not have an output.`)
        }
        const outputComponent = components[outputIndex];

        const instructions: string[] = [];

        for (const nodeIndex of topOrder) {
            // check if node is in same component as output
            const isUsed = components[nodeIndex] == outputComponent;
            const nodeData = connectionData.nodeDatas[nodeIndex];
            if (isUsed && nodeData != null) {
                if (nodeData.template.type === GNodeTemplateTypes.Base) {
                    const marker = `    # node ${nodeIndex};`;
                    const instructionBlock = setBlockIndent(nodeData.template.instructions!, 4);
                    instructions.push(marker, instructionBlock);
                }
            }
        }

        const functionName = `g_${geometry.id}`;
        const functionArgString = geometry.arguments
            .map(arg => `${arg.dataType} ${arg.id}`)
            .join(', ');

        const functionHeader = `${geometry.returnType} ${functionName}(${functionArgString})`
        const functionBody = instructions.join('\n');

        return {
            functionName,
            functionBlock: `${functionHeader} {\n${ functionBody }\n}\n`,
        }
    }
}
