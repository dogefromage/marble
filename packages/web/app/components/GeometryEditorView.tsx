import produce from "immer";
import { useEffect, useMemo, useState } from "react";
import styled from "styled-components";
import { useAppDispatch, useAppSelector } from "../redux/hooks";
import { geometriesAddNode, geometriesNew, selectGeometries } from "../slices/geometriesSlice";
import { GeometryS, Point } from "../types";
import { ViewProps } from "../types/View";
import { generateAdjacencyLists } from "../utils/geometries/generateAdjacencyLists";
import { NODE_TEMPLATES } from "../utils/geometries/testingTemplates";
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

        // let posX = 50;
        // let posY = 50;
        // for (const template of Object.values(NODE_TEMPLATES))
        // {
        //     dispatch(geometriesAddNode({
        //         geometryId: id,
        //         position: { x: posX, y: posY },
        //         template,
        //         undo: {},
        //     }))

        //     posX += 300;
        //     posY += 60;
        // }
        
        dispatch(geometriesAddNode({
            geometryId: id,
            position: { x: 500, y: 200 },
            template: NODE_TEMPLATES['output'],
            undo: {},
        }))
    }, []);

    const [ quickDial, setQuickDial ] = useState<{
        position: Point;
    }>();
    
    const zipped = useMemo(() =>
    {
        if (!geometryS || !NODE_TEMPLATES)
            return;

        return zipGeometry(geometryS, NODE_TEMPLATES);

    }, [ geometryS, NODE_TEMPLATES ]);

    const adjacencyLists = useMemo(() =>
    {
        if (!zipped) return;
        return generateAdjacencyLists(zipped);

    }, [ zipped?.validity ]);

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

    }, [ zipped, adjacencyLists ])

    const forwardEdges = adjacencyLists?.forwardsAdjList;

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
                templates={NODE_TEMPLATES}
                onClose={() => setQuickDial(undefined)}
            />
        }
        </EditorWrapper>
    )
}

export default GeometryEditor;
