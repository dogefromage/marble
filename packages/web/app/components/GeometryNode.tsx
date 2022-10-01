import { useMouseDrag } from '@marble/interactive';
import { useRef } from 'react';
import styled from 'styled-components';
import { v4 as uuidv4 } from 'uuid';
import { useAppDispatch } from '../redux/hooks';
import { geometriesPositionNode } from '../slices/geometriesSlice';
import { GNodeZ } from '../types';
import { ObjMap, Point } from '../types/utils';
import { GeometryEdge } from '../utils/geometries/generateAdjacencyLists';
import GeometryRowRoot from './GeometryRowRoot';

export const NODE_WIDTH = 160;

interface DivProps
{
    position: Point;
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

    cursor: pointer;
`;

interface Props
{
    geometryId: string;
    node: GNodeZ;
    forwardEdges: ObjMap<GeometryEdge[]> | undefined;
}

const GeometryNode = ({ geometryId, node, forwardEdges }: Props) =>
{
    const dispatch = useAppDispatch();

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
            const sCursor = dragRef.current!.startCursor;
            const sPos = dragRef.current!.startPosition;

            const position = 
            {
                x: sPos.x + e.clientX - sCursor.x,
                y: sPos.y + e.clientY - sCursor.y,
            }

            dispatch(geometriesPositionNode({
                geometryId,
                nodeId: node.id,
                position,
                undo: { 
                    actionToken: dragRef.current!.stackToken 
                },
            }))
        },
        cursor: 'grab',
    })

    return (
        <GeometryNodeDiv
            position={node.position}
            {...handlers}
        >
        {
            node.rows.map((row, rowIndex) =>
                <GeometryRowRoot 
                    geometryId={geometryId}
                    nodeId={node.id}
                    key={row.id}
                    row={row}
                    connected={
                        forwardEdges && forwardEdges[rowIndex]?.length > 0 ||
                        row.connectedOutput != null
                    }
                />
            )
        }
        { catcher }
        </GeometryNodeDiv>
    );
}

export default GeometryNode;