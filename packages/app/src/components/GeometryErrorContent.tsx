import React from 'react';
import { GeometryNodeNameWrapper, GeometryNodeTitle } from '../styles/GeometryNodeNameDivs';

export const GeometryMissingTemplateContent = () => {
    return (
        <GeometryNodeNameWrapper
            heightUnits={1}
            backColor={'#555555'}
        >
            <GeometryNodeTitle
                align='left'
            >
                {`Template missing!`}
            </GeometryNodeTitle>
        </GeometryNodeNameWrapper>
    );
}

export const GeometryErrorOccuredContent = () => {
    return (<>
        <GeometryNodeNameWrapper
            heightUnits={1}
            backColor={'#b51b1b'}
        >
            <GeometryNodeTitle align='left'>Node Error!</GeometryNodeTitle>
        </GeometryNodeNameWrapper>
    </>);
}