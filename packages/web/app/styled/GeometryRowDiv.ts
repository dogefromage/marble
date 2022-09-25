import styled from 'styled-components';

export const GNODE_ROW_UNIT_HEIGHT = 32;

export interface GeometryRowWrapperProps
{
    heightUnits: number;
}

const GeometryRowDiv = styled.div<GeometryRowWrapperProps>`
    
    height: ${({ heightUnits }) => `${heightUnits * GNODE_ROW_UNIT_HEIGHT}px` };

    display: flex;
    align-items: center;

    margin: 0 8px;

    position: relative;
`;

export default GeometryRowDiv;