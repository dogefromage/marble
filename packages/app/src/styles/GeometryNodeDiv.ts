import styled, { css } from 'styled-components';
import { Point, SelectionStatus } from '../types';
import { BORDER_RADIUS, BOX_SHADOW } from './utils';

export const NODE_WIDTH = 180;

export interface GeometryNodeDivProps
{
    position: Point;
    selectionStatus: SelectionStatus;
}

const GeometryNodeDiv = styled.div.attrs<GeometryNodeDivProps>(({ position }) =>
({
    style: {
        transform: `translate(${position.x}px, ${position.y}px)`
    }
}))<GeometryNodeDivProps>`

    position: absolute;
    top: 0;
    left: 0;

    width: ${NODE_WIDTH}px;
    
    background-color: white;
    ${BORDER_RADIUS}
    ${BOX_SHADOW}

    ${({ selectionStatus, theme }) => 
        selectionStatus !== SelectionStatus.Nothing && css`
            outline: solid calc(3px / min(var(--zoom), 1)) ${theme.colors.selectionStatus[selectionStatus]};
        `
    }

    cursor: pointer;
`;

export default GeometryNodeDiv;