// packages\web\editor\slices\views\GeometryEditor\components\GeometryEditor.tsx

import produce from 'immer';
import { useEffect, useMemo, useState } from 'react';
import styled from 'styled-components';
import { useAppDispatch, useAppSelector } from '../../../../redux/hooks/hooks';
import { ViewProps } from '../../types/View';
import { geometriesAddNode, geometriesNew, selectGeometries } from '../geometriesSlice';
import { Geometry, GNodeT, GNodeTypes } from '../types/Geometry';
import { DataTypes, RowTypes } from '../types/rows';
import { generateAdjacencyLists } from '../utils/generateAdjacencyLists';
import GNodeComponent from './GNodeComponent';
import LinkComponent from './LinkComponent';

const EditorWrapper = styled.div`
    position: relative;
    overflow: hidden;
    user-select: none;
    background-color: #71abab;

    background-position: 10px 20px;
    background-size: 150px 150px;
    background-image: 
        linear-gradient(#527c7c55 .1em, transparent .1em), 
        linear-gradient(90deg, #527c7c55 .1em, transparent .1em)
    ;
`;

export const HELLO_TEMPLATE: GNodeT = 
{
    id: 'template',
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

export const NODE_TEMPLATES = [ HELLO_TEMPLATE ];

const GeometryEditor = ({ }: ViewProps) =>
{
    const [ geometryId, setGeometryId ] = useState<string>();

    const dispatch = useAppDispatch();
    const geometry: Geometry | undefined = useAppSelector(selectGeometries)[geometryId || ''];

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
            position: { x: 200, y: 150 },
            template: HELLO_TEMPLATE,
            undo: {},
        }))
    }, []);
    
    const zippedGeometry = useMemo(() =>
    {
        if (!geometry) return;

        return produce(geometry, g =>
        {
            g.nodes.forEach(node => 
            {
                node.template = NODE_TEMPLATES.find(template => node.templateId === template.id);
            });
        })

    }, [ geometry, NODE_TEMPLATES ]);

    const adjacencyLists = useMemo(() =>
    {
        if (!zippedGeometry) return;
        return generateAdjacencyLists(zippedGeometry);
    }, [ zippedGeometry ]);

    const edges = adjacencyLists?.forwardAdjacencyList;

    return (
        <EditorWrapper>
        {
            geometryId && edges && zippedGeometry &&
            edges.map(subList =>
                subList.map(edge =>
                    <LinkComponent 
                        key={`${edge.fromNodeIndex}:${edge.fromRowIndex},${edge.linkId}`}
                        geometryId={geometryId}
                        edge={edge}
                        fromNode={zippedGeometry.nodes[edge.fromNodeIndex]}
                        toNode={zippedGeometry.nodes[edge.toNodeIndex]}
                    />
                )
            )
        }
        {
            zippedGeometry &&
            zippedGeometry.nodes.map(node =>
                <GNodeComponent
                    geometryId={zippedGeometry.id}
                    key={node.id}
                    node={node}
                />
            )
        }
        </EditorWrapper>
    )
}

export default GeometryEditor;



// packages\web\editor\slices\views\GeometryEditor\types\LinkDnd.ts

import { JointDirection } from "./rows";

export const LINK_DND_TAG = 'geometry-link-dnd';

export interface LinkDndTransfer 
{
    nodeId: string;
    rowId: string;
    direction: JointDirection;
}



// packages\web\editor\slices\views\GeometryEditor\types\Geometry.ts

import { Point } from "../../../../../utils/types/common";
import { BaseRowT, DataTypes, GNodeRow, JointLocation } from "./rows";

export type RowS<T extends BaseRowT = BaseRowT> = 
    Partial<T> &
{
    connectedOutput?: JointLocation;
}

export enum GNodeTypes
{
    Recursive,
    Default,
}

export interface GNodeT
{
    id: string;
    type: GNodeTypes;
    rows: Array<GNodeRow>;
}

export interface GNodeS
{
    id: string;
    type: GNodeTypes;
    templateId: string;
    template?: GNodeT;
    position: Point;
    rows: {
        [ rowId: string ]: RowS;
    }
}

export interface NodeEdge
{
    linkId: string;
    fromNodeIndex: number;
    fromRowIndex: number;
    toNodeIndex: number;
    toRowIndex: number;
    dataType: DataTypes;
}

export interface Geometry
{
    id: string;
    name: string;
    nodes: Array<GNodeS>;
    outputId?: string;
    validity: number;
    nextIdIndex: number;
    // nextLinkIndex: number;
}

export type GeometriesSliceState =
{
    [id: string]: Geometry;
}



// packages\web\editor\slices\views\GeometryEditor\types\rows\index.ts

import { FieldFloatRowT, FieldRowT } from "./field";

export enum DataTypes
{
    Unknown = 'unknown',
    Float = 'float',
}

export enum RowTypes
{
    Name,
    Field,
    Output,
}

export interface BaseRowT
{
    id: string;
    name: string;
}

export interface NameRowT extends BaseRowT
{
    type: RowTypes.Name;
}

export interface OutputRowT extends BaseRowT
{
    type: RowTypes.Output;
    dataType: DataTypes;
}

export type GNodeRow = 
    | NameRowT
    | FieldRowT
    | OutputRowT

export type JointDirection = 'input' | 'output';

export interface JointLocation
{
    nodeId: string;
    rowId: string;
}

// export interface JointLocationAndDirection
// {
//     nodeId: string;
//     rowId: string;
//     direction: JointDirection;
// }





// packages\web\editor\slices\views\GeometryEditor\geometriesSlice.ts

import { $CombinedState, createSlice } from "@reduxjs/toolkit";
import { v4 as uuidv4 } from "uuid";
import { generateAlphabeticalId } from "../../../../utils/generateAlphabeticalId";
import { Point } from "../../../../utils/types/common";
import { UndoableAction } from "../../../redux/enhancers/undoable/types/Undoable";
import { RootState } from "../../../redux/store";
import { GeometriesSliceState, Geometry, GNodeS, GNodeT } from "./types/Geometry";
import { JointDirection, JointLocation } from "./types/rows";

function createGeometry(id: string)
{
    const geometry: Geometry =
    {
        id,
        name: 'New Geometry',
        nodes: [],
        validity: 0,
        nextIdIndex: 0,
        // nextLinkIndex: 0,
    }

    return geometry;
}

function createNode(template: GNodeT, nextIdIndex: number, position: Point)
{
    const node: GNodeS = 
    {
        id: generateAlphabeticalId(nextIdIndex),
        position: { ...position },
        type: template.type,
        templateId: template.id,
        rows: {},
    }

    return {
        node,
        nextIdIndex: nextIdIndex + 1,
    };
}

function getGeometry(s: GeometriesSliceState, a: { payload: { geometryId: string } })
{
    const g = s[a.payload.geometryId];
    if (!g) return console.error(`Geometry with id ${a.payload.geometryId} not found`);
    return g;
}

function getNode(s: GeometriesSliceState, a: { payload: { geometryId: string, nodeId: string } })
{
    const n = getGeometry(s, a)?.nodes.find(n => n.id === a.payload.nodeId);
    if (!n) return console.error(`Node with id ${a.payload.nodeId} not found`);
    return n;
}

const initialState: GeometriesSliceState = {};

export const geometriesSlice = createSlice({
    name: 'geometries',
    initialState,
    reducers: {
        new: (s, a: UndoableAction<{ geometryId?: string }>) =>
        {
            const id = a.payload.geometryId || uuidv4();
            s[id] = createGeometry(id); 
        },
        remove: (s, a: UndoableAction<{ geometryId: string }>) =>
        {
            delete s[a.payload.geometryId];
        },
        addNode: (s, a: UndoableAction<{ geometryId: string, template: GNodeT, position: Point }>) =>
        {
            const g = getGeometry(s, a);
            if (!g) return;

            const { node, nextIdIndex } = createNode(a.payload.template, g.nextIdIndex, a.payload.position);
            g.nodes.push(node);
            g.nextIdIndex = nextIdIndex;
        },
        removeNode: (s, a: UndoableAction<{ geometryId: string, nodeId: string }>) =>
        {
            const g = getGeometry(s, a);
            if (!g) return;

            g.nodes = g.nodes.filter(n => n.id !== a.payload.nodeId);
            g.validity++;
        },
        positionNode: (s, a: UndoableAction<{ geometryId: string, nodeId: string, position: Point }>) =>
        {
            const n = getNode(s, a);
            if (!n) return;

            n.position = { ...a.payload.position };
        },
        assignRowData: (s, a: UndoableAction<{ geometryId: string, nodeId: string, rowId: string, rowData?: any }>) =>
        {
            const n = getNode(s, a);
            if (!n) return;

            if (a.payload.rowData)
            {
                n.rows[a.payload.rowId] = {
                    ...n.rows[a.payload.rowId],
                    ...a.payload.rowData,
                }
            }
            else
            {
                delete n.rows[a.payload.rowId];
            }
        },
        connectJoints: (s, a: UndoableAction<{ 
            geometryId: string, 
            inputJoint: JointLocation, 
            outputJoint: JointLocation, 
        }>) =>
        {
            const g = getGeometry(s, a);
            if (!g) return;

            const inputNode = getNode(s, { 
                payload: {
                    nodeId: a.payload.inputJoint.nodeId,
                    geometryId: a.payload.geometryId, 
                }
            }); 
            if (!inputNode) return;

            const inputRow = inputNode.rows[a.payload.inputJoint.rowId] || {};
            inputNode.rows[a.payload.inputJoint.rowId] = inputRow;

            inputRow.connectedOutput = { ...a.payload.outputJoint };

            // const nodeA = getNode(s, { 
            //     payload: {
            //         nodeId: a.payload.a_joint.nodeId,
            //         geometryId: a.payload.geometryId, 
            //     }
            // }); 
            // if (!nodeA) return;
            
            // const nodeB = getNode(s, { 
            //     payload: {
            //         nodeId: a.payload.b_joint.nodeId,
            //         geometryId: a.payload.geometryId, 
            //     }
            // }); 
            // if (!nodeB) return;

            // const rowA = 
            //     nodeA.rows[a.payload.a_joint.rowId] = 
            //     nodeA.rows[a.payload.a_joint.rowId] || {};

            // const rowB = 
            //     nodeB.rows[a.payload.b_joint.rowId] =
            //     nodeB.rows[a.payload.b_joint.rowId] || {};

            // const linkId = generateAlphabeticalId(g.nextLinkIndex);
            // g.nextLinkIndex++;

            // if (a.payload.a_dir === 'input')
            //     rowA.inputLink = rowB.outputLink = linkId;
            // else
            //     rowA.outputLink = rowB.inputLink = linkId;

            g.validity++;
        },
        disconnectJoints: (s, a: UndoableAction<{ geometryId: string, joints: JointLocation[] }>) =>
        {
            const g = getGeometry(s, a);
            if (!g) return;

            for (const joint of a.payload.joints)
            {
                const node = getNode(s, { 
                    payload: {
                        geometryId: a.payload.geometryId, 
                        nodeId: joint.nodeId,
                    }
                }); 
                if (!node) continue;

                const row = node.rows[joint.rowId];

                delete row.connectedOutput;
            }

            g.validity++;
        },
    }
});

export const {
    new: geometriesNew,
    remove: geometriesRemove,
    addNode: geometriesAddNode,
    removeNode: geometriesRemoveNode,
    positionNode: geometriesPositionNode,
    assignRowData: geometriesAssignRowData,
    connectJoints: geometriesConnectJoints,
    disconnectJoints: geometriesDisconnectJoints,
} = geometriesSlice.actions;

export const selectGeometries = (state: RootState) => state.project.present.geometries;

const geometriesReducer = geometriesSlice.reducer;

export default geometriesReducer;




// packages\web\editor\slices\views\GeometryEditor\components\LinkComponent.tsx

import React from 'react';
import styled from 'styled-components';
import { Point } from '../../../../../utils/types/common';
import { useAppDispatch } from '../../../../redux/hooks/hooks';
import { geometriesDisconnectJoints } from '../geometriesSlice';
import { GNodeS, NodeEdge } from '../types/Geometry';
import { DataTypes } from '../types/rows';
import getJointPosition from '../utils/getJointPosition';

interface LinkDivProps
{
    dataType: DataTypes;
    A: Point;
    B: Point;
}

const RADIUS = 2.5;

const LinkDiv = styled.div.attrs<LinkDivProps>(({ A, B, theme, dataType }) =>
{
    const dx = B.x - A.x;
    const dy = B.y - A.y;

    const width = Math.hypot(dx, dy) + 2 * RADIUS;
    const alpha = Math.atan2(dy, dx);

    return ({
        style:
        {
            width,
            transform: `
                translate(${A.x}px, ${A.y}px) 
                rotate(${alpha}rad)`,
            '--link-color': theme.colors.dataTypes[ dataType ],
        },
    })
})<LinkDivProps>`

    position: absolute;
    top: ${-RADIUS}px;
    left: ${-RADIUS}px;
    height: ${2 * RADIUS}px;
    transform-origin: ${RADIUS}px ${RADIUS}px;

    background-color: var(--link-color);

    border-radius: 1000px;

    opacity: 0.5;

    cursor: pointer;

    &:hover
    {
        opacity: 1;
    }
`;

interface Props
{
    geometryId: string;
    edge: NodeEdge;
    fromNode: GNodeS;
    toNode: GNodeS;
}

const LinkComponent = ({ geometryId, edge, fromNode, toNode }: Props) =>
{
    const dispatch = useAppDispatch();

    const A = getJointPosition(fromNode.position, edge.fromRowIndex, 'output');
    const B = getJointPosition(toNode.position, edge.toRowIndex, 'input');

    return (
        <LinkDiv
            dataType={edge.dataType}
            A={A}
            B={B}
            onClick={() =>
            {
                dispatch(geometriesDisconnectJoints({
                    geometryId,
                    joints: [
                        {
                            nodeId: fromNode.id,
                            rowId: fromNode.template!.rows[edge.fromRowIndex].id,
                            direction: 'output',
                        },
                        {
                            nodeId: toNode.id,
                            rowId: toNode.template!.rows[edge.toRowIndex].id,
                            direction: 'input',
                        },
                    ],
                    undo: {},
                }))
            }}
        />
    );
}

export default LinkComponent;