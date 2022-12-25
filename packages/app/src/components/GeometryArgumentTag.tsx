import React from 'react';
import { GeometryArgumentTagWrapperDiv, GeometryArgumentTagDiv } from '../styles/GeometryArgumentTagDiv';
import { GeometryArgument, Point } from '../types';

interface Props
{
    geometryId: string;
    position: Point;
    argument: GeometryArgument;
}

const GeometryArgumentTag = ({ geometryId, position, argument }: Props) =>
{
    return (
        <GeometryArgumentTagWrapperDiv
            position={position}
        >
            <GeometryArgumentTagDiv
                dataType={argument.dataType}
            >
                <p>
                    { argument.token }
                </p>
            </GeometryArgumentTagDiv>
        </GeometryArgumentTagWrapperDiv>
    );
}

export default GeometryArgumentTag;