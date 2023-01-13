import styled from 'styled-components';
import { BOX_SHADOW } from './utils';

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

    padding: 0 0.5rem 0.25rem;
    display: flex;
    flex-direction: column;

    width: ${VERTICAL_MENU_WIDTH}px;

    background-color: white;
    border-radius: 3px;
    ${BOX_SHADOW}
    outline: solid 1px black;

    z-index: 1;
`;

export default MenuVerticalDiv;