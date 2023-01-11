import React from 'react';
import styled from 'styled-components';
import { NameRowT } from '../types';
import { RowProps } from './GeometryRowRoot';
import GeometryRowDiv from '../styles/GeometryRowDiv';
import GeometryRowNameP from '../styles/GeometryRowNameP';
import { GeometryNodeNameWrapper, GeometryNodeTitle } from '../styles/GeometryNodeNameDivs';



const GeometryRowName = ({ row }: RowProps<NameRowT>) =>
{
    return (
        <GeometryNodeNameWrapper
            heightUnits={1}
            backColor={row.color}
        >
            <GeometryNodeTitle
                align='left'
            >
                { row.name }
            </GeometryNodeTitle>
        </GeometryNodeNameWrapper>
    );
}

export default GeometryRowName;