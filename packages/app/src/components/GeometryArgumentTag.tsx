import React from 'react';
import { GeometryArgumentTagDiv, GeometryArgumentTagWrapperDiv } from '../styles/GeometryArgumentTagDiv';
import { GeometryArgument } from '../types';

interface Props
{
    geometryId: string;
    // position: Point;
    argument: GeometryArgument;
}

const GeometryArgumentTag = ({ geometryId, argument }: Props) =>
{
    return (
        <GeometryArgumentTagWrapperDiv>
            <GeometryArgumentTagDiv
                dataType={argument.dataType}
            >
                <p>{ argument.token }</p>
            </GeometryArgumentTagDiv>
        </GeometryArgumentTagWrapperDiv>
    );
}

export default GeometryArgumentTag;