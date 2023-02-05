import React from 'react';
import styled from 'styled-components';
import { GeometryNodeNameWrapper, GeometryNodeTitle } from '../styles/GeometryNodeNameDivs';
import GeometryRowDiv from '../styles/GeometryRowDiv';

const ErrorDiv = styled.div`
    width: 100%;
    height: 100%;

    background: repeating-linear-gradient(
        45deg,
        #606dbc,
        #606dbc 10px,
        #465298 10px,
        #465298 20px
    );
`;

const GeometryMissingTemplateRows = () =>
{
    return (<>
        <GeometryNodeNameWrapper
            heightUnits={1}
            backColor={'#555555'}
        >
            <GeometryNodeTitle
                align='left'
            >
                {`Template missing!`}
            </GeometryNodeTitle>
            {/* <GeometryRowDiv
                heightUnits={2}
            >
            </GeometryRowDiv> */}

        </GeometryNodeNameWrapper>
    </>);
}

export default GeometryMissingTemplateRows;