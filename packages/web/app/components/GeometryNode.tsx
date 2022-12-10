import { useMouseDrag } from '@marble/interactive';
import { vec2 } from 'gl-matrix';
import React from 'react';
import { useRef } from 'react';
import { useSelector } from 'react-redux';
import styled, { css } from 'styled-components';
import { v4 as uuidv4 } from 'uuid';
import { selectPanelState } from '../enhancers/panelStateEnhancer';
import useContextMenu from '../hooks/useContextMenu';
import { useAppDispatch } from '../redux/hooks';
import { geometriesPositionNode } from '../slices/geometriesSlice';
import { geometryEditorSetActiveNode } from '../slices/panelGeometryEditorSlice';
import GeometryRowDiv from '../styled/GeometryRowDiv';
import { GNodeZ, PlanarCamera, ViewProps, ViewTypes } from '../types';
import { Point } from '../types/UtilityTypes';
import { vectorScreenToWorld } from '../utils/geometries/planarCameraMath';
import GeometryRowRoot from './GeometryRowRoot';
import { useWhatChanged } from '@simbathesailor/use-what-changed';

export const NODE_WIDTH = 180;

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
    panelId: string;
    geometryId: string;
    node: GNodeZ;
    getCamera: () => PlanarCamera | undefined;
}

const GeometryNode = ({ panelId, geometryId, node, getCamera }: Props) =>
{
    console.log('rendererd node');

    useWhatChanged([ panelId, geometryId, node, getCamera ])

    const dispatch = useAppDispatch();
    // const panelState = useSelector(selectPanelState(ViewTypes.GeometryEditor, viewProps.panelId));
    
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
            const camera = getCamera();

            if (!dragRef.current || !camera) return;

            const screenMove = vec2.fromValues(
                e.clientX - dragRef.current.startCursor.x,
                e.clientY - dragRef.current.startCursor.y,
            );

            const worldMove = vectorScreenToWorld(camera, screenMove);

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

    // const openContextMenu = useContextMenu(
    //     viewProps.panelId,
    //     'Geometry Node',
    //     [ 'geometryEditor.deleteNode' ],
    //     () => ({ nodeId: node.id }),
    // );

    const isActive = false;
    // const isActive = panelState?.activeNode === node.id;

    return (
        <GeometryNodeDiv
            // onContextMenu={openContextMenu}
            position={node.position}
            isActive={isActive}
            {...handlers}
            onClick={e =>
            {
                dispatch(geometryEditorSetActiveNode({
                    panelId,
                    nodeId: node.id,
                }))

                e.stopPropagation();
            }}
        >
        {
            <GeometryRowDiv
                heightUnits={2}
            >
                Test
            </GeometryRowDiv>
            // node.rows.map((row, rowIndex) =>
            //     <GeometryRowRoot
            //         geometryId={geometryId}
            //         nodeId={node.id}
            //         key={row.id}
            //         row={row}
            //     />
            // )
        }
        { catcher }
        </GeometryNodeDiv>
    );
}

export default React.memo(GeometryNode);