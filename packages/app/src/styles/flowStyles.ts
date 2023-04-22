import styled, { css } from 'styled-components';
import { DataTypes, SelectionStatus, Vec2 } from '../types';
import { BORDER_RADIUS, BORDER_RADIUS_TOP, BOX_SHADOW } from './utils';

export const FLOW_NODE_ROW_HEIGHT = 24;
export const FLOW_NODE_MIN_WIDTH = 7 * FLOW_NODE_ROW_HEIGHT;

export interface FlowNodeDivProps {
    position: Vec2;
    selectionStatus: SelectionStatus;
}
export const FlowNodeDiv = styled.div.attrs<FlowNodeDivProps>(({ position }) => ({
    style: {
        transform: `translate(${position.x}px, ${position.y}px)`,
    },
})) <FlowNodeDivProps>`

    position: absolute;
    top: 0;
    left: 0;
    min-width: ${FLOW_NODE_MIN_WIDTH}px;

    background-color: ${({ theme }) => theme.colors.flowEditor.nodeColor};
    ${BORDER_RADIUS}
    ${BOX_SHADOW}

    ${({ selectionStatus, theme }) =>
        selectionStatus !== SelectionStatus.Nothing && css`
            outline: solid calc(3px / min(var(--zoom), 1)) ${theme.colors.selectionStatus[selectionStatus]};
        `
    }

    cursor: pointer;
`;

export const FlowNodeRowDiv = styled.div`
    display: grid;
    grid-auto-rows: ${FLOW_NODE_ROW_HEIGHT}px;

    align-items: center;
    grid-template-columns: 100%;
    padding: 0 12px;
    position: relative;
`;

export const FlowNodeNameWrapper = styled(FlowNodeRowDiv) <{
    backColor?: string;
}>`
    background-color: ${({ backColor }) => backColor ?? '#333'};
    color: white;
    ${BORDER_RADIUS_TOP}
    margin: 0;
    padding: 0 8px;
`;

export const FlowNodeRowNameP = styled.p<{
    align: 'right' | 'left';
    bold?: boolean;
}>`
    width: 100%;
    height: ${FLOW_NODE_ROW_HEIGHT}px;
    margin: 0;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
    text-align: ${({ align }) => align};
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    ${({ bold }) => bold && `font-weight: bold;`}
`;

export const FlowJointDiv = styled.div<{
    direction: 'input' | 'output';
    dataType: DataTypes;
    isHovering: boolean;
}>`
    position: absolute;
    top: ${0.5 * FLOW_NODE_ROW_HEIGHT}px;
    ${({ direction }) =>
        `${direction === 'input' ?
            'left' : 'right'}: -10px`
    };
    width: 20px;
    height: ${FLOW_NODE_ROW_HEIGHT}px;
    transform: translateY(-50%);
    
    /* background-color: #ff000033; */

    display: flex;
    align-items: center;
    justify-content: center;

    div {
        width: 10px;
        height: 10px;
        
        transition: transform 50ms;

        background-color: ${({ theme, dataType }) => theme.colors.dataTypes[dataType]};
        border: solid 2px #00000033;

        ${({ isHovering }) => isHovering && `transform: scale(1.3);`}
    }
    
    &:hover div {
        transform: scale(1.3);
    }
`;
