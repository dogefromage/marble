import { GeometryZ, SceneProgramTree } from "../../types";
import { generateAdjacencyLists } from "../geometries/generateAdjacencyLists";
import { checkGeometryAcyclic } from "./checkGeometryAcyclic";
import findUsedNodes from "./findUsed";
import { generateTopologicalOrder } from "./generateTopologicalOrder";

export enum GeometriesCompilationErrorTypes
{
    OutputMissing = 'output-missing',
    HasCycle = 'has-cycle',
}

export class GeometriesCompilationError extends Error
{
    constructor(
        public type: GeometriesCompilationErrorTypes
    )
    {
        super(`Error "${type}" at compiling geometry`);
    }
}

export function compileGeometries(
    geometry: GeometryZ,
): SceneProgramTree
{
    /**
     * Form of a geometry
     * - must have output
     * - must be acyclic
     */

    const outputIndex = geometry.nodes.findIndex(n => n.id === geometry.outputId);
    if (outputIndex < 0)
        throw new GeometriesCompilationError(
            GeometriesCompilationErrorTypes.OutputMissing,
        );

    const { forwards: forwardsAdjList, backwards: backwardsAdjList } = generateAdjacencyLists(geometry);

    console.log('forwardsAdjList')
    console.log(forwardsAdjList);

    // check acyclic
    const firstCycleFound = checkGeometryAcyclic(forwardsAdjList);
    if (firstCycleFound >= 0)
        throw new GeometriesCompilationError(
            GeometriesCompilationErrorTypes.HasCycle,
        );
    /**
     * Interpretation of graph connections
     * - generate list of used
     * - create topological order
     */

    // find used nodes
    const used = findUsedNodes(forwardsAdjList, outputIndex);

    const topoOrder = generateTopologicalOrder(forwardsAdjList);

    console.log(geometry.nodes.map(node => node.rows[0].name));

    console.log('used');
    console.log(used);

    console.log('topoOrder');
    console.log(topoOrder);

    return {
        nodes: [],
    }
}