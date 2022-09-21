import { useEffect, useMemo, useState } from "react";
import styled from "styled-components";
import { useAppDispatch, useAppSelector } from "../redux/hooks";
import { geometriesAddNode, geometriesNew, selectGeometries } from "../slices/geometriesSlice";
import { GeometryS, GNodeT, GNodeTypes } from "../types";
import { DataTypes, RowTypes } from "../types/geometry/Rows";
import { KeyValueMap } from "../types/utils";
import { ViewProps } from "../types/View";
import { generateAdjacencyLists } from "../utils/geometry/generateAdjacencyLists";
import zipGeometry from "../utils/geometry/zipGeometry";
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

export const HELLO_TEMPLATE: GNodeT = 
{
    id: 'hello_template',
    type: GNodeTypes.Default,
    rows: [
        {
            id: 'row1',
            type: RowTypes.Name,
            name: 'Hello Node Editor!',
        },
        {
            id: 'outputrow',
            type: RowTypes.Output,
            dataType: DataTypes.Float,
            name: 'Main Output',
        },
        {
            id: 'row2',
            type: RowTypes.Field,
            dataType: DataTypes.Float,
            value: 5,
            name: 'TestRow',
        }
    ],
}

export const NODE_TEMPLATES: KeyValueMap<GNodeT> = 
{
    [HELLO_TEMPLATE.id]: HELLO_TEMPLATE,
};

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

        dispatch(geometriesAddNode({
            geometryId: id,
            position: { x: 100, y: 150 },
            template: HELLO_TEMPLATE,
            undo: {},
        }))

        dispatch(geometriesAddNode({
            geometryId: id,
            position: { x: 400, y: 350 },
            template: HELLO_TEMPLATE,
            undo: {},
        }))

        dispatch(geometriesAddNode({
            geometryId: id,
            position: { x: 520, y: 200 },
            template: HELLO_TEMPLATE,
            undo: {},
        }))
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

    const forwardEdges = adjacencyLists?.forwards;
    const backwardEdges = adjacencyLists?.backwards;

    return (
        <EditorWrapper>
        {
            geometryId && geometryZ && backwardEdges &&
            backwardEdges.map(subList =>
                subList.map(edge =>
                    <LinkComponent 
                        key={edge.key}
                        geometryId={geometryId}
                        edge={edge}
                        fromNode={geometryZ.nodes[edge.fromNodeIndex]}
                        toNode={geometryZ.nodes[edge.toNodeIndex]}
                    />
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
