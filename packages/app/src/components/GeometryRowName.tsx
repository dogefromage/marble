import React from 'react';
import { GeometryNodeNameWrapper, GeometryNodeTitle } from '../styles/GeometryNodeNameDivs';
import { NameRowT } from '../types';
import { RowProps } from './GeometryRowRoot';

const GeometryRowName = ({ row }: RowProps<NameRowT>) => {
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