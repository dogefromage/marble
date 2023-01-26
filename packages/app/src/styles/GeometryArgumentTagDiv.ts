import styled from 'styled-components';
import { StaticDataTypes } from '../types';
import { GNODE_ROW_UNIT_HEIGHT } from './GeometryRowDiv';
import { BORDER_RADIUS, BOX_SHADOW } from './utils';

export const GeometryArgumentTagWrapperDiv = styled.div`
    position: absolute;
    top: 50%;
    left: -14px;
`;

export interface GeometryArgumentTagDivProps
{
    dataType: StaticDataTypes;
}

export const GeometryArgumentTagDiv = styled.div<GeometryArgumentTagDivProps>`
    
    position: absolute;
    top: 0;
    right: 0;

    height: ${GNODE_ROW_UNIT_HEIGHT - 4}px;
    transform: translateY(-50%);

    background-color: white;
    border-right: solid 7px;
    border-color: ${({ dataType, theme }) => theme.colors.dataTypes[dataType] };

    ${BOX_SHADOW}

    display: flex;
    align-items: center;

    padding: 0 0.25rem 0;
    ${BORDER_RADIUS}

    p {
        font-weight: bold;
        margin: 0;
    }
`;