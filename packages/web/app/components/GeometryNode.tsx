import { useMouseDrag } from '@marble/interactive';
import { vec2 } from 'gl-matrix';
import React, { useRef } from 'react';
import styled, { css } from 'styled-components';
import { v4 as uuidv4 } from 'uuid';
import useContextMenu from '../hooks/useContextMenu';
import { useAppDispatch } from '../redux/hooks';
import { geometriesMoveNodes, geometriesPositionNode, geometriesSetSelectedNodes } from '../slices/geometriesSlice';
import { GNodeS, GNodeT, PlanarCamera, RowZ } from '../types';
import { Point, SelectionStatus } from '../types/UtilityTypes';
import { vectorScreenToWorld } from '../utils/geometries/planarCameraMath';
import { v2p } from '../utils/linalg';
import GeometryRowRoot from './GeometryRowRoot';

export const NODE_WIDTH = 180;

interface DivProps
{
    position: Point;
    selectionStatus: SelectionStatus;
}

const GeometryNodeDiv = styled.div.attrs<DivProps>(({ position }) =>
({
    style: {
        transform: `translate(${position.x}px, ${position.y}px)`
    }
}))<DivProps>`

    position: absolute;
    top: 0;
    left: 0;

    width: ${NODE_WIDTH}px;
    
    background-color: white;
    border-radius: 3px;
    box-shadow: 5px 5px #00000066;

    ${({ selectionStatus, theme }) => (selectionStatus !== SelectionStatus.Nothing) ? 
        css`
            outline: solid calc(3px / var(--zoom)) ${theme.colors.selectionStatus[selectionStatus]};
            /* outline-offset: 1px; */
        ` : ``
    }

    cursor: pointer;
`;

interface Props
{
    panelId: string;
    geometryId: string;
    nodeState: GNodeS;
    nodeTemplate?: GNodeT;
    connectedRows: Set<string>;
    getCamera: () => PlanarCamera | undefined;
    selectionStatus: SelectionStatus;
}

const GeometryNode = ({ panelId, geometryId, nodeState, nodeTemplate, connectedRows, getCamera, selectionStatus }: Props) =>
{
    const dispatch = useAppDispatch();
 
    const dragRef = useRef<{
        startCursor: Point;
        lastCursor: Point;
        startPosition: Point;
        stackToken: string;
    }>();

    // const setSelected = () => {
    //     dispatch(geometriesSetSelectedNodes({
    //         geometryId,
    //         selection: [ nodeState.id ],
    //         undo: {},
    //     }))
    // }

    const { handlers, catcher } = useMouseDrag({
        mouseButton: 0,
        start: e =>
        {
            dragRef.current = 
            {
                startCursor: { x: e.clientX, y: e.clientY },
                lastCursor: { x: e.clientX, y: e.clientY },
                startPosition: { ...nodeState.position },
                stackToken: 'drag_node:' + uuidv4(),
            };
            e.stopPropagation();

            if (selectionStatus == SelectionStatus.Nothing) {
                dispatch(geometriesSetSelectedNodes({
                    geometryId,
                    selection: [ nodeState.id ],
                    undo: {},
                }))
            }
        },
        move: e => 
        {
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

            // const screenMove = vec2.fromValues(
            //     e.clientX - dragRef.current.startCursor.x,
            //     e.clientY - dragRef.current.startCursor.y,
            // );
            // const worldMove = vectorScreenToWorld(camera, screenMove);


            // const newPos = 
            // {
            //     x: dragRef.current.startPosition.x + worldMove[0],
            //     y: dragRef.current.startPosition.y + worldMove[1],
            // };

            // dispatch(geometriesPositionNode({
            //     geometryId,
            //     nodeId: nodeState.id,
            //     position: newPos,
            //     undo: { actionToken: dragRef.current!.stackToken },
            // }));
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
        >
        {
            nodeTemplate &&
            nodeTemplate.rows.map(rowTemplate =>
            {
                const rowState = nodeState.rows[rowTemplate.id];
                const isConnected = connectedRows.has(rowTemplate.id);
                
                // @ts-ignore
                const rowZ: RowZ = { 
                    ...rowTemplate, 
                    ...rowState,
                    isConnected,
                } // merge rows

                return (
                    <GeometryRowRoot
                        geometryId={geometryId}
                        nodeId={nodeState.id}
                        key={rowZ.id}
                        row={rowZ}
                    />
                );
            })
        }
        { catcher }
        </GeometryNodeDiv>
    );
}

export default React.memo(GeometryNode);