import styled from "styled-components";
import { BORDER_RADIUS_TOP } from "./utils";

export const MenuTitleDiv = styled.div<{ backColor?: string }>`

    width: calc(100% + 0.5rem);
    margin: 0 -0.25rem; // ugly hack

    height: 35px;

    ${BORDER_RADIUS_TOP}

    background-color: ${({ backColor }) => backColor || '#444' };
    color: white;

    display: flex;
    align-items: center;

    p
    {
        margin: 0;
        padding: 0 1.5rem;
        font-weight: bold;

        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
    }
`;
