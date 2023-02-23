import styled from 'styled-components';
import { Point } from '../types';
import { BORDER_RADIUS, BOX_SHADOW } from './utils';

export const VERTICAL_MENU_WIDTH = 240;

export interface MenuVerticalDivProps {
    anchor: Point;
    width?: string;
}

const MenuVerticalDiv = styled.div.attrs<MenuVerticalDivProps>(({ 
    anchor, width,
}) => {
    return {
        style: {
            width,
            left: anchor.x + 'px',
            top: anchor.y + 'px',
        },
    };
})<MenuVerticalDivProps>`
    position: fixed;

    padding: 0 4px 4px;
    display: flex;
    flex-direction: column;

    width: ${VERTICAL_MENU_WIDTH}px;

    background-color: white;
    ${BORDER_RADIUS}
    ${BOX_SHADOW}
    outline: solid 1px #00000077;

    z-index: 1;
`;

export default MenuVerticalDiv;