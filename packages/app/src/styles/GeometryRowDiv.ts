import styled from 'styled-components';

export const GNODE_ROW_UNIT_HEIGHT = 28;

export interface GeometryRowWrapperProps
{
    heightUnits: number;
}

const GeometryRowDiv = styled.div<GeometryRowWrapperProps>`
    
    height: ${({ heightUnits }) => `${heightUnits * GNODE_ROW_UNIT_HEIGHT}px` };

    display: grid;
    grid-template-rows: repeat(
        ${({ heightUnits }) => heightUnits }, 
        ${GNODE_ROW_UNIT_HEIGHT}px
    );
    align-items: center;
    grid-template-columns: 100%;
    
    margin: 0 8px;

    position: relative;
`;

export default GeometryRowDiv;