import React from 'react';
import { GeometryArgumentTagDiv, GeometryArgumentTagWrapperDiv } from '../styles/GeometryArgumentTagDiv';
import { InputRowT } from '../types';

interface Props {
    geometryId: string;
    argument: InputRowT;
}

const GeometryArgumentTag = ({ geometryId, argument }: Props) => {
    return (
        <GeometryArgumentTagWrapperDiv>
            <GeometryArgumentTagDiv
                dataType={argument.dataType}
            >
                <p>{argument.name}</p>
            </GeometryArgumentTagDiv>
        </GeometryArgumentTagWrapperDiv>
    );
}

export default GeometryArgumentTag;