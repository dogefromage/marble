import styled, { css } from 'styled-components';
import { Vec2, SelectionStatus } from '../types';
import { BORDER_RADIUS, BOX_SHADOW } from './utils';

export const DEFAULT_NODE_WIDTH = 180;

export interface GeometryNodeDivProps
{
    position: Vec2;
    width: number;
    selectionStatus: SelectionStatus;
}

const GeometryNodeDiv = styled.div.attrs<GeometryNodeDivProps>(({ position, width }) => ({
    style: {
        transform: `translate(${position.x}px, ${position.y}px)`,
        width: `${width}px`,
    }
}))<GeometryNodeDivProps>`

    position: absolute;
    top: 0;
    left: 0;

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