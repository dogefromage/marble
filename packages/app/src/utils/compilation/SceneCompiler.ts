import { GeometryCompilerErrorTypes, GeometryConnectionData, GeometryNodeScope, GeometryProgramMethod, GeometryS, GNodeT, GNodeTemplateTags, GNodeTemplateTypes, ObjMap, ProgramInclude, SceneCompilerErrorInfo, SceneProgram } from "../../types";
import generateGeometryConnectionData from "../geometries/generateGeometryConnectionData";
import geometryNodesToGraphAdjacency from "../graph/geometryNodesToGraphAdjacency";
import orderGraph from "../graph/orderGraph";
import hashIntArray from "./hashIntArray";
import { parser, generate } from '@shaderfrog/glsl-parser';
import { AstNode, BinaryNode, CompoundStatementNode, DeclarationStatementNode, FunctionNode, NodeVisitor, NodeVisitors, PreprocessorNode, Program, ReturnStatementNode, visit } from "@shaderfrog/glsl-parser/ast";
import IdentifierRenamer from "./IdentifierRenamer";

export class SceneCompilationError extends Error 
{
    constructor(msg: string) {
        super("Scene could not be compiled: " + msg);
    }
}

export default class SceneCompiler 
{
    private templates: ObjMap<GNodeT> = {};
    private includes: ObjMap<ProgramInclude> = {};
    private compiledProgram: SceneProgram | null = null;
    private errorInfos: SceneCompilerErrorInfo[] = [];

    public getErrorInfos() { return this.errorInfos; }

    public setTemplates(templates: ObjMap<GNodeT>)
    {
        this.templates = templates;
    }

    public setIncludes(includes: ObjMap<ProgramInclude>)
    {
        this.includes = includes;
    }

    public compileGeometries(geoMap: ObjMap<GeometryS>)
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
                    throw new SceneCompilationError(`Geometries dependency with id ${dependency} not found.`);
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
            throw new SceneCompilationError(`Geometry dependencies form a cycle.`);
        }

        const { topOrder } = programGraphData;
        // const includesSet = new Set<ProgramInclude>();

        const geometryMethods = topOrder.map(geometryIndex => 
        {
            const geo = geoList[geometryIndex];
            const data = dataList[geometryIndex];
            const compiled = this.compileGeometry(geo, data);

            // const { compiledGeometry, includes } = compiled;

            // for (const includeId of includes) {
            //     const includeItem = this.includes[includeId];
            //     if (includeItem == null) {
            //         this.errorInfos.push({
            //             type: GeometryCompilerErrorTypes.MissingInclude,
            //             geometryId: geo.id,
            //             include: includeId,
            //         });
            //         throw new Error(`Included glsl code "${includeId}" missing in geometry ${geo.name}.`);
            //     }
            // }
            // return compiledGeometry;
        });

        // const sceneProgram: SceneProgram = {
        //     hash, 
        //     includes: [ ...includesSet ],
        //     geometryMethods,
        // }
    }

    public compileGeometry(geometry: GeometryS, connectionData: GeometryConnectionData)
    {
        // find lowest index where a node has an output tag
        let outputIndex = -1;
        for (let i = geometry.nodes.length - 1; i >= 0; i--) {
            if (geometry.nodes[i].tags?.includes(GNodeTemplateTags.Output)) {
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

        // if (data.strayConnectedJoints.length > 0)
        //     throw new GeometriesCompilationError(
        //         GeometriesCompilationErrorTypes.InvalidGraph,
        //     )

        // const foundCycles = checkGeometryAcyclic(data.forwardEdges);
        // if (foundCycles.length)
        //     throw new GeometriesCompilationError(
        //         GeometriesCompilationErrorTypes.HasCycle,
        //     );

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

        /**
         * Interpretation of graph connections
         * - generate list of used
         * - create topological order
         * - generate function args
         * - generate variable names using adjList
         * - generate operation using topological order and variable names
         */

        // const used = findUsedNodes(data.forwardEdges, outputIndex);
        // const topoOrder = generateTopologicalOrder(data.forwardEdges, outputIndex);
        // const orderedUsedNodeIndices = topoOrder.filter(index => used.has(index));

        /**
         * Program props
         */
        // const functionArgs = [ ...DefaultFunctionArgs ];
        // const textureVarMappings: ObjMap<ProgramTextureVarMapping> = {};
        // const programInstructions: string[] = [];
        // const includedTokenSet = new Set<string>();

        // tokenize all nodes into array long pseudo string scoped at the current node

        const instructionCodeBlock = topOrder.reduce((total, nodeIndex) => {
            const node = geometry.nodes[nodeIndex];
            const template = connectionData.nodeTemplates[nodeIndex];
            if (!template) throw new Error(`Template missing`);

            if (template.type === GNodeTemplateTypes.Composite) {
                throw new Error(`implement`);
            }

            total += `# node ${nodeIndex};`; // sets scope to current node
            total += template.instructionTemplates!; 

            return total;
        }, '');

        // create function wrapper for parser to work
        const fullSource = `a b() {
            ${instructionCodeBlock}
        }`

        // parse source
        let ast: Program;
        try {
            // console.log(fullSource);
            ast = parser.parse(fullSource, { quiet: true });
        } catch (e: any) {
            throw new SceneCompilationError(e.message);
        }

        // retrieve instructions array from full ast
        const wrapperFunctionNode = ast.program?.[0] as FunctionNode;
        if (wrapperFunctionNode?.type !== 'function') {
            throw new Error(`Node should be function`);
        }

        const renamer = new IdentifierRenamer(geometry, connectionData);

        const visitors: NodeVisitors = {
            preprocessor: {
                enter: path => 
                {
                    const pre = path.node.line;
                    const matchNode = pre.match(/#\s*node\s+(\w+);/);
                    if (matchNode != null) {
                        const nodeIndex = Number(matchNode[1]);
                        renamer.setScope(nodeIndex);
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
        
        visit(wrapperFunctionNode.body, visitors);

        const statements = wrapperFunctionNode.body.statements.filter(
            s => s.type !== 'preprocessor'
        );

        const generatedCode = generate(statements);
        console.log('GENERATED:\n' + generatedCode);

        // for (const nodeIndex of topOrder)
        // {
        //     const node = geometry.nodes[nodeIndex];
        //     const template = data.templateMap.get(node.id);
        //     if (!template) { throw new Error(`Template missing`); }

        //     const nodeCompilerOutput = compileNodeInstructions(
        //         nodeIndex, node, template,
        //         textureCoordinateCounter,
        //         data.backwardEdges[nodeIndex],
        //     );
            
        //     nodeCompilerOutput.includedTokens
        //         .forEach(token => includedTokenSet.add(token));

        //     nodeCompilerOutput.instructions
        //         .forEach(instruction => programInstructions.push(instruction));

        //     Object.assign(textureVarMappings, nodeCompilerOutput.textureVarMappings);
        // }

        // const includedTokens = [ ...includedTokenSet ];

        // // not final, must choose right output row (or construct object if multiple rows maybe)
        // const outputNodeId = geometry.nodes[outputIndex].id;
        // const outputTemplate = data.templateMap.get(outputNodeId)!;
        // const outputInputRow = outputTemplate.rows.find(row => row.id === 'input');
        // const methodReturnType = (outputInputRow as InputOnlyRowT).dataType;

        // const finalProgram: GeometryProgramMethod =
        // {
        //     geometryId: geometry.id,
        //     compilationValidity: geometry.compilationValidity,
        //     includedTokens,
        //     programInstructions,
        //     methodName: `geometry_${geometry.id}`,
        //     functionArgs,
        //     textureVarMappings,
        //     methodReturnType,
        // }

        // // console.log(finalProgram);

        // return finalProgram;


        // const compiledGeometry: GeometryProgramMethod = 5;
        // const includes: string[];

        // return {
        //     compiledGeometry,
        //     includes,
        // }
    }
}