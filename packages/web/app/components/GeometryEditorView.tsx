import { useEffect, useMemo, useState } from "react";
import styled from "styled-components";
import { useAppDispatch, useAppSelector } from "../redux/hooks";
import { geometriesAddNode, geometriesNew, selectGeometries } from "../slices/geometriesSlice";
import { GeometryS } from "../types";
import { ViewProps } from "../types/View";
import { generateAdjacencyLists } from "../utils/geometries/generateAdjacencyLists";
import { NODE_TEMPLATES } from "../utils/geometries/testingTemplates";
import zipGeometry from "../utils/geometries/zipGeometry";
import LinkComponent from "./GeometryLink";
import GeometryNode from "./GeometryNode";

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
    const [ geometryId, setGeometryId ] = useState<string>();

    const dispatch = useAppDispatch();
    const geometryS: GeometryS | undefined = useAppSelector(selectGeometries)[geometryId || ''];

    useEffect(() =>
    {
        const id = '1234';
        dispatch(geometriesNew({
            geometryId: id,
            undo: {},
        }));
        setGeometryId(id);

        let posX = 50;
        let posY = 50;
        for (const template of Object.values(NODE_TEMPLATES))
        {
            dispatch(geometriesAddNode({
                geometryId: id,
                position: { x: posX, y: posY },
                template,
                undo: {},
            }))

            posX += 300;
            posY += 60;
        }
    }, []);
    
    const geometryZ = useMemo(() =>
    {
        if (!geometryS || !NODE_TEMPLATES)
            return;

        return zipGeometry(geometryS, NODE_TEMPLATES);
    }, [ geometryS, NODE_TEMPLATES ]);

    const adjacencyLists = useMemo(() =>
    {
        if (!geometryZ) return;
        return generateAdjacencyLists(geometryZ);
    }, [ geometryZ?.validity ]);

    const forwardEdges = adjacencyLists?.forwardsAdjList;

    return (
        <EditorWrapper>
        {
            geometryId && geometryZ && forwardEdges &&
            Object.values(forwardEdges).map(nodeEdges =>
                Object.values(nodeEdges).map(rowEdges =>
                    rowEdges.map(edge =>
                        <LinkComponent 
                            key={edge.key}
                            geometryId={geometryId}
                            edge={edge}
                            fromNode={geometryZ.nodes[edge.fromNodeIndex]}
                            toNode={geometryZ.nodes[edge.toNodeIndex]}
                        />
                    )
                )
            )
        }
        {
            geometryZ && forwardEdges &&
            geometryZ.nodes.map((node, nodeIndex) =>
                <GeometryNode
                    geometryId={geometryZ.id}
                    key={node.id}
                    node={node}
                    forwardEdges={forwardEdges[nodeIndex]}
                />
            )
        }
        </EditorWrapper>
    )
}

export default GeometryEditor;
