import { useMouseDrag } from '@marble/interactive';
import { vec2 } from 'gl-matrix';
import React, { useRef } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { useAppDispatch } from '../redux/hooks';
import { geometriesMoveNodes, geometriesSetSelectedNodes } from '../slices/geometriesSlice';
import { geometryEditorPanelsPushGeometryId } from '../slices/panelGeometryEditorSlice';
import GeometryNodeDiv from '../styles/GeometryNodeDiv';
import { decomposeTemplateId, GNodeData, GNodeState, GNodeTemplateTypes, PlanarCamera, RowZ } from '../types';
import { Point, SelectionStatus } from '../types/UtilityTypes';
import { vectorScreenToWorld } from '../utils/geometries/planarCameraMath';
import { v2p } from '../utils/linalg';
import GeometryMissingTemplateRows from './GeometryMissingTemplateRows';
import GeometryRowRoot from './GeometryRowRoot';

interface Props {
    panelId: string;
    geometryId: string;
    nodeState: GNodeState;
    nodeData: GNodeData | null;
    getCamera: () => PlanarCamera | undefined;
    selectionStatus: SelectionStatus;
}

const GeometryNode = ({ panelId, geometryId, nodeState, nodeData, getCamera, selectionStatus }: Props) => {
    const dispatch = useAppDispatch();

    const dragRef = useRef<{
        startCursor: Point;
        lastCursor: Point;
        startPosition: Point;
        stackToken: string;
    }>();

    const ensureSelection = () => {
        if (selectionStatus == SelectionStatus.Nothing) {
            dispatch(geometriesSetSelectedNodes({
                geometryId,
                selection: [ nodeState.id ],
                undo: {},
            }))
        }
    }

    const { handlers, catcher } = useMouseDrag({
        mouseButton: 0,
        start: e => {
            dragRef.current =
            {
                startCursor: { x: e.clientX, y: e.clientY },
                lastCursor: { x: e.clientX, y: e.clientY },
                startPosition: { ...nodeState.position },
                stackToken: 'drag_node:' + uuidv4(),
            };
            e.stopPropagation();
            ensureSelection();
        },
        move: e => {
            const camera = getCamera();

            if (!dragRef.current || !camera) return;

            const screenDelta = vec2.fromValues(
                e.clientX - dragRef.current.lastCursor.x,
                e.clientY - dragRef.current.lastCursor.y,
            );
            dragRef.current.lastCursor = { x: e.clientX, y: e.clientY };
            const worldMove = vectorScreenToWorld(camera, screenDelta);
            const delta = v2p(worldMove);

            dispatch(geometriesMoveNodes({
                geometryId,
                delta,
                undo: { actionToken: dragRef.current!.stackToken },
            }));
        },
    }, {
        cursor: 'grab',
    });

    return (
        <GeometryNodeDiv
            position={nodeState.position}
            selectionStatus={selectionStatus}
            {...handlers}
            onClick={e => {
                e.stopPropagation();
            }}
            onDoubleClick={e => {
                // enter nested geometry
                if (nodeData?.template == null) {
                    return;
                }
                const { id: subGeoId, type: templateType } = decomposeTemplateId(nodeData.template.id);
                if (templateType === 'composite') {
                    dispatch(geometryEditorPanelsPushGeometryId({
                        panelId,
                        geometryId: subGeoId,
                    }));
                    e.stopPropagation();
                }
            }}
            onContextMenu={() => ensureSelection()} // context will be triggered further down in tree
        >
        {
            nodeData ? (
                nodeData.template.rows.map(rowTemplate => {
                    const rowState = nodeState.rows[ rowTemplate.id ];
                    const numConnectedJoints = nodeData.rowConnections[ rowTemplate.id ];

                    // @ts-ignore
                    const rowZ: RowZ = {
                        ...rowTemplate,
                        ...rowState,
                        numConnectedJoints,
                    } // merge rows

                    return (
                        <GeometryRowRoot
                            geometryId={geometryId}
                            panelId={panelId}
                            nodeId={nodeState.id}
                            key={rowZ.id}
                            row={rowZ}
                        />
                    );
                })
            ) : (
                <GeometryMissingTemplateRows />
            )
        }
        { catcher }
        </GeometryNodeDiv>
    );
}

export default React.memo(GeometryNode);