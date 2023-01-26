import { generate, parser } from '@shaderfrog/glsl-parser';
import { NodeVisitors, Program, visit } from "@shaderfrog/glsl-parser/ast";
import { mapDynamicValues, preprocessSource, setBlockIndent } from '.';
import { rootOutputTemplateId } from '../../content/defaultTemplates/outputTemplates';
import { decomposeTemplateId, DependencyGraph, GeometryConnectionData, GeometryS, getDependencyKey, Layer, LayerProgram, ObjMapUndef, ProgramInclude, splitDependencyKey } from "../../types";
import analyzeGraph from '../analyzeBasicGraph';
import { findClosingBracket, splitBracketSafe } from '../codeStrings';
import topSortDependencies from '../dependencyGraph/topSortDependencies';
import geometryNodesToGraphAdjacency from "../geometries/geometryNodesToGraphAdjacency";
import { LOOKUP_TEXTURE_WIDTH } from '../viewportView/GLProgramRenderer';
import { createReturntypePlaceholder, generateStackedExpression } from './generateCodeStatements';
import IdentifierRenamer from "./IdentifierRenamer";

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

        const topSortedGeos: string[] = [];
        for (const key of topSortAll) {
            const { type, id } = splitDependencyKey(key);
            if (type == 'geometry') {
                topSortedGeos.push(id);
            }
        }

        const geometryFunctionBlocks: string[] = [];

        let rootFunctionName = '';

        // get necessary geometries and datas in right order
        const geoList: GeometryS[] = [];
        const dataList: GeometryConnectionData[] = [];
        for (let geoIndex = 0; geoIndex < topSortedGeos.length; geoIndex++) {
            const geoId = topSortedGeos[ geoIndex ];
            const geoOrderEl = dependencyGraph.order.get(getDependencyKey(geoId, 'geometry'))!;
            const geo = geometries[ geoId ];
            const data = geometryDatas[ geoId ];
            if (!geo || !data || geo.version != geoOrderEl.version || geo.version != data.geometryVersion) {
                this.compileErrorMessages.set(layer.id, `Data version missaligned`);
                return null;
            }

            geoList.push(geo);
            dataList.push(data);
            // generate code for geometry
            const { functionName, functionBlock } = this.generateGeometryFunction(geo, data);
            const marker = `# geometry ${geoIndex};`;
            geometryFunctionBlocks.push(marker, functionBlock);

            if (geoIndex == topSortedGeos.length - 1) {
                rootFunctionName = functionName;
            }
        }

        const source = geometryFunctionBlocks.join(`\n`);

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
        // console.info(preprocessedSource);

        // parse source
        let programAst: Program;
        try {
            programAst = parser.parse(preprocessedSource, { quiet: true });
        } catch (e: any) {
            throw new Error(e.message);
        }

        const renamer = new IdentifierRenamer({ textureVarRowIndex });
        const usedIncludes = new Set<string>();

        const visitors: NodeVisitors = {
            preprocessor: {
                enter: path => {
                    const pre = path.node.line;
                    // # geometry ...
                    const matchGeo = pre.match(/#\s*geometry\s+(\w+);/i);
                    if (matchGeo != null) {
                        const geometryIndex = Number(matchGeo[ 1 ]);
                        const geo = geoList[ geometryIndex ];
                        const data = dataList[ geometryIndex ];
                        renamer.setGeometry(geo, data);
                        path.remove();
                    }
                    // # node ....
                    const matchNode = pre.match(/#\s*node\s+(\w+);/i);
                    if (matchNode != null) {
                        const nodeIndex = Number(matchNode[ 1 ]);
                        renamer.setNode(nodeIndex);
                        path.remove();
                    }
                    // # include ....
                    const matchIncludes = pre.match(/#\s*include\s+(\w+(?:\s*,\s*\w+)*)\s*;/i);
                    if (matchIncludes != null) {
                        const includesRaw = matchIncludes[ 1 ]!;
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
                    const isDirectInitializer = parentType === 'declaration' && path.key === 'initializer';
                    const isOtherReference = [ 'binary', 'function_call', 'postfix', 'return_statement' ].includes(parentType);
                    if (isDirectInitializer || isOtherReference) {
                        renamer.replaceReference(path);
                    }
                }
            }
        }

        visit(programAst, visitors);
        renamer.addAdditionalStatements(programAst);

        const textureVarMappings = renamer.getTextureVarMappings();
        const emptyRow = new Array(LOOKUP_TEXTURE_WIDTH).fill(0);
        const textureVarRow = mapDynamicValues(textureVarMappings, emptyRow, geometries, geometryDatas, true)!;

        const generatedCode = generate(programAst);
        console.info(generatedCode);
        const usedIncludesArr = [ ...usedIncludes ].map(incId => {
            const inc = includes[ incId ];
            if (!inc) {
                throw new Error(`Include ${incId} is missing!`);
            }
            return inc;
        });
        const layerOrderEl = dependencyGraph.order.get(rootLayerKey);
        const layerHash = layerOrderEl!.hash;

        return {
            id: layer.id,
            index: layer.index,
            name: layer.name,
            hash: layerHash,
            mainProgramCode: generatedCode,
            includes: usedIncludesArr,
            rootFunctionName,
            textureVarMappings,
            textureVarRowIndex,
            textureVarRow,
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
            throw new Error(`Cyclic nodes found while compiling geometry.`);
            // for (const cycle of cycles) {
            // }
        }

        // find lowest index where a node is output
        let outputIndex = -1;
        for (let i = geometry.nodes.length - 1; i >= 0; i--) {
            if (geometry.nodes[ i ].templateId === rootOutputTemplateId) {
                outputIndex = i;
                break;
            }
        }
        if (outputIndex < 0) {
            throw new Error(`Geometry does not have an output.`);
        }
        const outputComponent = components[ outputIndex ];

        const instructions: string[] = [];

        for (const nodeIndex of topOrder) {
            // check if node is in same component as output
            const isUsed = components[ nodeIndex ] == outputComponent;
            const nodeData = connectionData.nodeDatas[ nodeIndex ];
            if (isUsed && nodeData != null) {
                if (decomposeTemplateId(nodeData.template.id).templateType  === 'static') {
                    const marker = `    # node ${nodeIndex};`;
                    const instructionBlock = setBlockIndent(nodeData.template.instructions!, 4);
                    instructions.push(marker, instructionBlock);
                }
            }
        }

        const functionName = `g_${geometry.id}`;
        const functionArgString = geometry.inputs
            .map(arg => `${arg.dataType} ${arg.id}`)
            .join(', ');

        const returnType = createReturntypePlaceholder(geometry.outputs);

        const functionHeader = `${returnType} ${functionName}(${functionArgString})`
        const functionBody = instructions.join('\n');

        return {
            functionName,
            functionBlock: `${functionHeader} {\n${functionBody}\n}\n`,
        }
    }
}
