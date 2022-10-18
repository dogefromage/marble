import React from 'react';
import styled from 'styled-components';
import { useAppDispatch } from '../redux/hooks';
import { geometriesDisconnectJoints } from '../slices/geometriesSlice';
import { DataTypes, GNodeZ, Point } from '../types';
import countHeightUnits from '../utils/geometries/countHeightUnits';
import { GeometryEdge } from '../utils/geometries/generateAdjacencyLists';
import getJointPosition from '../utils/geometries/getJointPosition';

interface LinkDivProps
{
    dataType: DataTypes;
    A: Point;
    B: Point;
}

const LinkDiv = styled.div.attrs<LinkDivProps>(({ A, B, theme, dataType }) =>
{
    const dx = B.x - A.x;
    const dy = B.y - A.y;

    const width = Math.hypot(dx, dy);
    const alpha = Math.atan2(dy, dx);

    return ({
        style:
        {
            width: `calc(${width}px + 2 * var(--radius))`,
            transform: `
                translate(${A.x}px, ${A.y}px) 
                rotate(${alpha}rad)`,
            '--link-color': theme.colors.dataTypes[ dataType ],
        },
    })
})<LinkDivProps>`

    --radius: 2.5px;

    position: absolute;
    top: calc(-1 * var(--radius));
    left: calc(-1 * var(--radius));
    height: calc(2 * var(--radius));
    transform-origin: var(--radius) var(--radius);

    background-color: var(--link-color);

    border-radius: 1000px;

    /* opacity: 0.5; */

    cursor: pointer;

    &:hover
    {
        /* opacity: 1; */

        --radius: 4px
    }
`;

interface Props
{
    geometryId: string;
    edge: GeometryEdge;
    fromNode: GNodeZ;
    toNode: GNodeZ;
}

const LinkComponent = ({ geometryId, edge, fromNode, toNode }: Props) =>
{
    const dispatch = useAppDispatch();

    const heightA = countHeightUnits(fromNode.rows, edge.fromRowIndex);
    const A = getJointPosition(fromNode.position, heightA, 'output');
    const heightB = countHeightUnits(toNode.rows, edge.toRowIndex);
    const B = getJointPosition(toNode.position, heightB, 'input');

    const joints = [
        {
            nodeId: fromNode.id,
            rowId: fromNode.rows[edge.fromRowIndex].id,
        },
        {
            nodeId: toNode.id,
            rowId: toNode.rows[edge.toRowIndex].id,
        },
    ];

    return (
        <LinkDiv
            dataType={edge.dataType}
            A={A}
            B={B}
            onClick={() =>
            {
                dispatch(geometriesDisconnectJoints({
                    geometryId,
                    joints,
                    undo: {},
                }))
            }}
        />
    );
}

export default LinkComponent;