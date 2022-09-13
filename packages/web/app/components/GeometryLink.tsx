import React from 'react';
import styled from 'styled-components';
import { useAppDispatch } from '../redux/hooks';
import { geometriesDisconnectJoints } from '../slices/GeometriesSlice/geometriesSlice';
import { DataTypes, GNodeZ } from '../slices/GeometriesSlice/types/Geometry';
import countHeightUnits from '../utils/geometry/countHeightUnits';
import { GeometryEdge } from '../utils/geometry/generateAdjacencyLists';
import getJointPosition from '../utils/geometry/getJointPosition';
import { Point } from '../utils/types/common';

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
    edge: GeometryEdge;
    fromNode: GNodeZ;
    toNode: GNodeZ;
}

const LinkComponent = ({ geometryId, edge, fromNode, toNode }: Props) =>
{
    const dispatch = useAppDispatch();

    const heightA = countHeightUnits(fromNode, edge.fromRowIndex);
    const A = getJointPosition(fromNode.position, heightA, 'output');
    const heightB = countHeightUnits(toNode, edge.toRowIndex);
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