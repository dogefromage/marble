import React from 'react';
import styled from 'styled-components';
import { NameRowT } from '../types';
import { RowProps } from './GeometryRowRoot';
import GeometryRowDiv from '../styled/GeometryRowDiv';
import GeometryRowNameP from '../styled/GeometryRowNameP';

interface WrapperProps
{
    backColor: string;
}

const TitleWrapper = styled(GeometryRowDiv)<WrapperProps>`
    
    background-color: ${({ backColor }) => backColor };
    color: white;

    border-radius: 3px 3px 0 0;

    margin: 0;
    padding: 0 8px;
`;

const NodeTitle = styled(GeometryRowNameP)`
    
    font-weight: bold;
    
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
`

const GeometryRowName = ({ row }: RowProps<NameRowT>) =>
{
    return (
        <TitleWrapper
            heightUnits={1}
            backColor={row.color}
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