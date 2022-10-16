import produce from "immer";
import { useEffect, useMemo, useState } from "react";
import styled from "styled-components";
import { useAppDispatch, useAppSelector } from "../redux/hooks";
import { geometriesAddNode, geometriesNew, selectGeometries } from "../slices/geometriesSlice";
import { selectTemplates } from "../slices/templatesSlice";
import { GeometryS, Point } from "../types";
import { ViewProps } from "../types/View";
import { generateAdjacencyLists } from "../utils/geometries/generateAdjacencyLists";
import zipGeometry from "../utils/geometries/zipGeometry";
import LinkComponent from "./GeometryLink";
import GeometryNode from "./GeometryNode";
import GeometryNodeQuickdial from "./GeometryNodeQuickdial";

const EditorWrapper = styled.div`

    width: 100%;
    height: 100%;

    position: relative;
    overflow: hidden;
    user-select: none;
    background-color: #e0e0e0;

    --grid-size: 20px;
    --grid-thick: 1px;
    --grid-color: #c6c8cc;

    background-position: 10px 20px;
    background-size: var(--grid-size) var(--grid-size);
    background-image: 
        linear-gradient(var(--grid-color) var(--grid-thick), transparent var(--grid-thick)), 
        linear-gradient(90deg, var(--grid-color) var(--grid-thick), transparent var(--grid-thick))
    ;
`;

const GeometryEditor = ({ }: ViewProps) =>
{
    // const [ geometryId, setGeometryId ] = useState<string>();
    const geometryId = '1234';

    const { templates } = useAppSelector(selectTemplates);

    const dispatch = useAppDispatch();
    const geometryS: GeometryS | undefined = useAppSelector(selectGeometries)[geometryId];

    function createGeometry()
    {
        dispatch(geometriesNew({
            geometryId,
            undo: {},
        }));
        // setGeometryId(id);
    };

    const [ quickDial, setQuickDial ] = useState<{
        position: Point;
    }>();
    
    const zipped = useMemo(() =>
    {
        if (!geometryS || !templates)
            return;

        try
        {
            return zipGeometry(geometryS, templates);
        }
        catch { }

    }, [ geometryS, templates ]);

    const adjacencyLists = useMemo(() =>
    {
        if (!zipped) return;
        return generateAdjacencyLists(zipped);

    }, [ zipped?.compilationValidity ]);

    const withConnections = useMemo(() =>
    {
        if (!zipped || !adjacencyLists) 
            return;

        return produce(zipped, z =>
        {
            for (let nodeIndex = 0; nodeIndex < z.nodes.length; nodeIndex++)
            {
                const node = z.nodes[nodeIndex];

                for (let rowIndex = 0; rowIndex < node.rows.length; rowIndex++)
                {
                    const row = node.rows[rowIndex];
                    
                    const inputExists = adjacencyLists.backwardsAdjList[nodeIndex]?.[rowIndex] != null;
                    const outputExists = adjacencyLists.forwardsAdjList[nodeIndex]?.[rowIndex]?.length > 0;
                    
                    row.displayConnected = inputExists || outputExists;
                }
            }
        });

    }, [ zipped, adjacencyLists ]);

    const forwardEdges = adjacencyLists?.forwardsAdjList;

    if (!withConnections)
    {
        return (
            <button
                onClick={createGeometry}
            >
                "Create geometry"
            </button>
        )
    }

    return (
        <EditorWrapper
            onDoubleClick={e =>
            {
                const position = {
                    x: e.pageX,
                    y: e.pageY,
                };

                setQuickDial({
                    position,
                })
            }}
        >
        {
            forwardEdges && withConnections &&
            Object.values(forwardEdges).map(nodeEdges =>
                Object.values(nodeEdges).map(rowEdges =>
                    rowEdges.map(edge =>
                        <LinkComponent 
                            key={edge.key}
                            geometryId={withConnections.id}
                            edge={edge}
                            fromNode={withConnections.nodes[edge.fromNodeIndex]}
                            toNode={withConnections.nodes[edge.toNodeIndex]}
                        />
                    )
                )
            )
        }
        {
            withConnections &&
            withConnections.nodes.map(node =>
                <GeometryNode
                    geometryId={withConnections.id}
                    key={node.id}
                    node={node}
                />
            )
        }
        {
            geometryId && quickDial && 
            <GeometryNodeQuickdial 
                geometryId={geometryId}
                position={quickDial.position}
                templates={templates}
                onClose={() => setQuickDial(undefined)}
            />
        }
        </EditorWrapper>
    )
}

export default GeometryEditor;
