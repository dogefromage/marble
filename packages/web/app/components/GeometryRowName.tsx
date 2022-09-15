import React from 'react';
import styled from 'styled-components';
import { NameRowT } from '../types/Geometry';
import { RowProps } from './GeometryRowRoot';
import GeometryRowDiv from './styled/GeometryRowDiv';
import GeometryRowNameP from './styled/GeometryRowNameP';

const TitleWrapper = styled(GeometryRowDiv)`
    
    background-color: #a3264e;
    /* background-color: black; */
    color: white;

    /* background-image: url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAMAAAADCAYAAABWKLW/AAAAHElEQVQYV2NUVFT8f//+fUYGBgYGMAEDcA5IBQCKJQVmn76DhAAAAABJRU5ErkJggg=="); */
    

    border-radius: 3px 3px 0 0;

    margin: 0;
    padding: 0 8px;
`;

const NodeTitle = styled(GeometryRowNameP)`
    
    font-weight: bold;
`

const GeometryRowName = ({ geometryId, nodeId, row }: RowProps<NameRowT>) =>
{
    return (
        <TitleWrapper
            heightUnits={1}
        >
            <NodeTitle
                align='left'
            >
                { row.name }
            </NodeTitle>
        </TitleWrapper>
    );
}

export default GeometryRowName;