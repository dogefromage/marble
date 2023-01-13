import styled from "styled-components";
import { MenuElementDiv, MENU_ROW_HEIGHT } from "./MenuElementDiv";
import { FONT_FAMILY } from "./utils";

export const MenuSearchDiv = styled(MenuElementDiv)`
    &:hover
    {
        background-color: unset;
    }

    form
    {
        input
        {
            width: 100%;
            height: ${MENU_ROW_HEIGHT}px;

            outline: none;
            border: none;
            padding: 0 1rem;
            
            border-radius: 3px;

            background-color: #e5e4eb;
            box-shadow: inset 2px 2px #00000033;

            font-weight: normal;
            font-size: 1rem;
            font-family: ${FONT_FAMILY};
        }
    }
`;