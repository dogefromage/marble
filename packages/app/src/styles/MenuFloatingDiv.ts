import styled from 'styled-components';
import { BORDER_RADIUS, BOX_SHADOW } from './utils';

export const VERTICAL_MENU_WIDTH = 320;

export interface MenuVerticalDivProps
{
    left?: string;
    top?: string;
    bottom?: string;
    right?: string;
    width?: string;
}

const MenuVerticalDiv = styled.div.attrs<MenuVerticalDivProps>(({ 
    left, top, bottom, right, width,
}) => {
    return {
        style: {
            left, top, bottom, right, width,
        },
    };
})<MenuVerticalDivProps>`
    position: absolute;

    padding: 0 0.25rem 0.25rem;
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