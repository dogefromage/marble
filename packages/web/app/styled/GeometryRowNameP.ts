import styled from 'styled-components';
import { GNODE_ROW_UNIT_HEIGHT } from './GeometryRowDiv';

export interface GeometryRowNameProps
{
    align: 'right' | 'left';
}

const GeometryRowNameP = styled.p<GeometryRowNameProps>`
    
    width: 100%;
    margin: 0;

    text-align: ${({ align }) => align };
`;

export default GeometryRowNameP;