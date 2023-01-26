import styled, { css } from "styled-components";
import { StaticDataTypes, GeometryJointDirection } from "../types";
import { GNODE_ROW_UNIT_HEIGHT } from "./GeometryRowDiv";

export const JOINT_OFFSET = -32;

interface Props 
{
    direction: GeometryJointDirection;
    connected: boolean;
    additional?: boolean;
    dataType: StaticDataTypes;
    isHovering: boolean;
}

export const GeometryJointDiv = styled.div<Props>`
    position: absolute;

    /* top: 50%; */
    top: ${0.5 * GNODE_ROW_UNIT_HEIGHT}px;

    ${({ direction }) => 
        `${ direction === 'input' ? 
            'left' : 'right'}: ${JOINT_OFFSET}px` 
    };

    /* width: 24px; */
    width: 30px;
    border-radius: 50%;
    aspect-ratio: 1;

    transform: translateY(-50%);

    /* background-color: #ff000033; */

    display: flex;
    align-items: center;
    justify-content: center;

    .joint-inner
    {
        width: 12px;
        ${({ isHovering }) => isHovering ? `width: 16px` : '' };
        aspect-ratio: 1;

        background-color: ${({ theme, dataType }) => theme.colors.dataTypes[dataType] };
        border-radius: 50%;

        ${({ additional, theme, dataType }) => additional ? css`
            background-color: unset;
            outline: solid 3px ${theme.colors.dataTypes[dataType]};
            outline-offset: -3px;
        ` : ''} 

        opacity: ${({ connected, isHovering }) => 
        {
            if (isHovering) return 1;
            if (connected) return 0;
            return 0.5;
        }};
    }
    
    &:hover .joint-inner
    {
        opacity: 1;
    }
`;
