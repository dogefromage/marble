import styled from 'styled-components';
import { DataTypes, Point } from '../types';
import { GNODE_ROW_UNIT_HEIGHT } from './GeometryRowDiv';

export interface GeometryArgumentTagWrapperDivProps
{
    position: Point;
}

export const GeometryArgumentTagWrapperDiv = styled.div.attrs<GeometryArgumentTagWrapperDivProps>(({ position, theme }) =>
{
    const { x, y } = position;
    return ({
        style:
        {
            transform: `translate(${x}px, ${y}px)`,
        },
    })
})<GeometryArgumentTagWrapperDivProps>`
    position: absolute;
    top: 0;
    left: 0;
`;

export interface GeometryArgumentTagDivProps
{
    dataType: DataTypes;
}

export const GeometryArgumentTagDiv = styled.div<GeometryArgumentTagDivProps>`
    
    position: absolute;
    top: 0;
    right: -5px;

    height: ${GNODE_ROW_UNIT_HEIGHT}px;
    transform: translateY(-50%);

    background-color: white;
    /* border: solid 1px; */
    /* border-color: ${({ dataType, theme }) => theme.colors.dataTypes[dataType] }; */

    box-shadow: 5px 5px #00000066;

    display: flex;
    align-items: center;

    padding: 0 0.5rem 0 0.25rem;
    border-radius: 5px 15px 15px 5px;

    p {
        font-weight: bold;
        margin: 0;
    }
`;