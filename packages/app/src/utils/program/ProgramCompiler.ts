import { generate, parser } from '@shaderfrog/glsl-parser';
import { NodeVisitors, Program, visit } from "@shaderfrog/glsl-parser/ast";
import { OUTPUT_TEMPLATE_ID } from '../../assets/defaultTemplates/outputTemplates';
import { GeometryCompilerErrorTypes, GeometryConnectionData, GeometryS, GNodeT, GNodeTemplateTags, GNodeTemplateTypes, ObjMap, ProgramInclude, RenderLayerProgram, SceneCompilerErrorInfo } from "../../types";
import generateGeometryConnectionData from "../geometries/generateGeometryConnectionData";
import geometryNodesToGraphAdjacency from "../graph/geometryNodesToGraphAdjacency";
import orderGraph from "../graph/orderGraph";
import { LOOKUP_TEXTURE_SIZE } from '../viewport/ViewportQuadProgram';
import { GeometryCompilationError, TemplateNotFoundException } from './GeometryCompilationError';
import hashIntArray from "./hashIntArray";
import IdentifierRenamer from "./IdentifierRenamer";

export default class ProgramCompiler 
{
    private templates: ObjMap<GNodeT> = {};
    private includes: ObjMap<ProgramInclude> = {};
    private compiledProgram: RenderLayerProgram | null = null;
    private errorInfos: SceneCompilerErrorInfo[] = [];

    public getErrorInfos() { return this.errorInfos; }
    public setTemplates(templates: ObjMap<GNodeT>) { this.templates = templates; }
    public setIncludes(includes: ObjMap<ProgramInclude>) { this.includes = includes; }

    public compileRenderLayer(geoMap: ObjMap<GeometryS>)
    {
        this.errorInfos = []; // reset old

        const geoList = Object.values(geoMap);

        // detect changes
        const validityList = geoList.map(g => g.compilationValidity);
        const hash = hashIntArray(validityList);
        if (hash === this.compiledProgram?.hash)
            return; // no changes

        const dataList = geoList.map(geo => generateGeometryConnectionData(geo, this.templates));

        // find topological sorting
        const numGeometries = geoList.length;
        // generate adjlist
        const geometriesAdjacency = new Array(numGeometries).fill(0).map<number[]>(_ => []);
        
        for (let u = 0; u < geoList.length; u++) {
            for (const dependency of dataList[u].dependencies) {
                const v = geoList.findIndex(g => g.id == dependency);

                if (v < 0) { // dependency was not found
                    const uId = geoList[u].id;
                    this.errorInfos.push({
                        type: GeometryCompilerErrorTypes.MissingDependency,
                        geometryId: uId,
                        dependency,
                    });
                    throw new GeometryCompilationError(`Geometries dependency with id ${dependency} not found.`);
                }

                // u depends on v <=> an edge (v,u) exists
                geometriesAdjacency[v].push(u);
            }
        }

        const programGraphData = orderGraph(numGeometries, geometriesAdjacency);

        // cycle error
        if (programGraphData.cycles.length > 0) {
            for (const cycle of programGraphData.cycles) {
                this.errorInfos.push({
                    type: GeometryCompilerErrorTypes.CyclicGeometryReferences,
                    geometryIds: cycle.map(index => geoList[index].id),
                })
            }
            throw new GeometryCompilationError(`Geometry dependencies form a cycle.`);
        }

        const { topOrder } = programGraphData;

        const geometryFunctionBlocks: string[] = [];

        for (const geometryIndex of topOrder) {
            const geo = geoList[geometryIndex];
            const data = dataList[geometryIndex];
            const functionBlock = this.generateGeometryFunction(geo, data);
            const marker = `# geometry ${geometryIndex};`;
            geometryFunctionBlocks.push(marker, functionBlock);
        }

        const source = geometryFunctionBlocks.join(`\n`);

        // parse source
        let programAst: Program;
        try {
            programAst = parser.parse(source, { quiet: true });
        } catch (e: any) {
            throw new GeometryCompilationError(e.message);
        }

        const renamer = new IdentifierRenamer();
        const usedIncludes = new Set<string>();

        const visitors: NodeVisitors = {
            preprocessor: {
                enter: path => 
                {
                    const pre = path.node.line;
                    // # geometry ...
                    const matchGeo = pre.match(/#\s*geometry\s+(\w+);/);
                    if (matchGeo != null) {
                        const geometryIndex = Number(matchGeo[1]);
                        const geo = geoList[geometryIndex];
                        const data = dataList[geometryIndex];
                        renamer.setGeometry(geo, data);
                        path.remove();
                    }
                    // # node ....
                    const matchNode = pre.match(/#\s*node\s+(\w+);/);
                    if (matchNode != null) {
                        const nodeIndex = Number(matchNode[1]);
                        renamer.setNode(nodeIndex);
                        path.remove();
                    }
                    // # include ....
                    const matchInclude = pre.match(/#\s*include\s+(\w+);/);
                    if (matchInclude != null) {
                        const include = matchInclude[1]!;
                        usedIncludes.add(include);
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
        
        const usedIncludesArr = [ ...usedIncludes ].map(incId =>
        {
            const inc = this.includes[incId];
            if (!inc) {
                throw new GeometryCompilationError(`Include ${incId} is missing!`);
            }
            return inc;
        });

        const program: RenderLayerProgram = {
            id: 'test',
            name: '^lkjaslda',
            hash,
            mainProgramCode: generatedCode,
            includes: usedIncludesArr,
            rootFunctionName: 'hello',
            textureVarLookupData: new Array(LOOKUP_TEXTURE_SIZE * LOOKUP_TEXTURE_SIZE),
        }
        return program;
    }

    public generateGeometryFunction(
        geometry: GeometryS, 
        connectionData: GeometryConnectionData,
    ) {
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
            throw new Error(`Geometry "${geometry.name}" does not have an output.`)
        }

        const n = geometry.nodes.length;
        const nodeAdjacency = geometryNodesToGraphAdjacency(n, connectionData.forwardEdges);
        const { topOrder, cycles } = orderGraph(n, nodeAdjacency);

        if (cycles.length) { // invalid because cycles
            for (const cycle of cycles) {
                this.errorInfos.push({
                    type: GeometryCompilerErrorTypes.CyclicNodes,
                    geometryId: geometry.id,
                    cyclicNodes: cycle,
                });
            }
            throw new Error(`Geometry "${geometry.name}" has cyclic connected nodes.`);
        }

        // tokenize all nodes into array long pseudo string scoped at the current node

        const instructions: string[] = [];

        for (const nodeIndex of topOrder) {
            const template = connectionData.nodeTemplates[nodeIndex];
            if (template != null) {
                if (template.type === GNodeTemplateTypes.Base) {
                    const marker = `# node ${nodeIndex};`;
                    instructions.push(marker, template.instructionTemplates!);
                }
            }
        }

        const functionName = `g_${geometry.id}`;
        const functionArgString = geometry.arguments
            .map(arg => `${arg.dataType} ${arg.identifier}`)
            .join(', ');

        const functionHeader = `${geometry.returnType} ${functionName}(${functionArgString})`
        const functionBody = instructions.join('');

        return `${functionHeader} {\n${ functionBody } \n} \n`
    }
}
