import { useMouseDrag } from '@marble/interactive';
import { vec2 } from 'gl-matrix';
import { useRef } from 'react';
import styled, { css } from 'styled-components';
import { v4 as uuidv4 } from 'uuid';
import useContextMenu from '../hooks/useContextMenu';
import { useAppDispatch } from '../redux/hooks';
import { geometriesPositionNode } from '../slices/geometriesSlice';
import { geometryEditorSetActiveNode, selectGeometryEditorPanels } from '../slices/panelGeometryEditorSlice';
import { GNodeZ, ViewProps } from '../types';
import { Point } from '../types/UtilityTypes';
import { vectorScreenToWorld } from '../utils/geometries/planarCameraMath';
import { usePanelState } from '../utils/panelState/usePanelState';
import GeometryRowRoot from './GeometryRowRoot';

export const NODE_WIDTH = 160;

interface DivProps
{
    position: Point;
    isActive: boolean;
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

    ${({ isActive }) => isActive ? css`
        /* outline: solid 2px #2b2b2b;
        outline-offset: 2px; */
        outline: solid 2px #e74a54;
    ` : ''}   

    cursor: pointer;
`;

interface Props
{
    viewProps: ViewProps;
    geometryId: string;
    node: GNodeZ;
}

const GeometryNode = ({ viewProps, geometryId, node }: Props) =>
{
    const dispatch = useAppDispatch();
    const panelState = usePanelState(selectGeometryEditorPanels, viewProps.panelId);

    const dragRef = useRef<{
        startCursor: Point;
        startPosition: Point;
        stackToken: string;
    }>();

    const { handlers, catcher } = useMouseDrag({
        mouseButton: 0,
        start: e =>
        {
            dragRef.current = 
            {
                startCursor: { x: e.clientX, y: e.clientY },
                startPosition: { ...node.position },
                stackToken: 'drag_node:' + uuidv4(),
            };
        },
        move: e => 
        {
            if (!dragRef.current || !panelState) return;

            const screenMove = vec2.fromValues(
                e.clientX - dragRef.current.startCursor.x,
                e.clientY - dragRef.current.startCursor.y,
            );

            const worldMove = vectorScreenToWorld(panelState.camera, screenMove);

            const newPos = 
            {
                x: dragRef.current.startPosition.x + worldMove[0],
                y: dragRef.current.startPosition.y + worldMove[1],
            };

            dispatch(geometriesPositionNode({
                geometryId,
                nodeId: node.id,
                position: newPos,
                undo: { 
                    actionToken: dragRef.current!.stackToken 
                },
            }));
        },
        cursor: 'grab',
    });

    const openContextMenu = useContextMenu(
        viewProps.panelId,
        'Geometry Node',
        [ 'geometryEditor.deleteNode' ],
        () => ({ nodeId: node.id }),
    );

    const isActive = panelState?.activeNode === node.id;

    return (
        <GeometryNodeDiv
            onContextMenu={openContextMenu}
            position={node.position}
            isActive={isActive}
            {...handlers}
            onClick={e =>
            {
                dispatch(geometryEditorSetActiveNode({
                    panelId: viewProps.panelId,
                    nodeId: node.id,
                }))

                e.stopPropagation();
            }}
            // onDoubleClick={e => 
            // {
            //     dispatch(geometriesRemoveNode({
            //         geometryId: geometryId,
            //         nodeId: node.id,
            //         undo: {}
            //     }));
                
            //     e.stopPropagation();
            // }}
        >
        {
            node.rows.map((row, rowIndex) =>
                <GeometryRowRoot
                    geometryId={geometryId}
                    nodeId={node.id}
                    key={row.id}
                    row={row}
                />
            )
        }
        { catcher }
        </GeometryNodeDiv>
    );
}

export default GeometryNode;