import React from 'react';
import { useAppSelector } from '../redux/hooks';
import { selectSingleGeometry } from '../slices/geometriesSlice';
import { GeometryArgumentTagDiv, GeometryArgumentTagWrapperDiv } from '../styles/GeometryArgumentTagDiv';
import { InputRowT } from '../types';

interface Props {
    geometryId: string;
    argumentId: string;
}

const GeometryArgumentTag = ({ geometryId, argumentId }: Props) => {
    const geometry = useAppSelector(selectSingleGeometry(geometryId));
    if (!geometry) return null;

    const argument = geometry.inputs.find(input => input.id === argumentId);

    return (
        <GeometryArgumentTagWrapperDiv>
            <GeometryArgumentTagDiv
                dataType={argument?.dataType || 'unknown'}
                missing={argument == null}
            >
                <p>{argument?.name || argumentId}</p>
            </GeometryArgumentTagDiv>
        </GeometryArgumentTagWrapperDiv>
    );
}

export default GeometryArgumentTag;