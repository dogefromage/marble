import React from 'react';
import { FlowNodeNameWrapper, FlowNodeRowNameP } from '../styles/flowStyles';

export const FlowNodeMissingContent = () => {
    return (
        <FlowNodeNameWrapper
            backColor={'#555555'}
        >
            <FlowNodeRowNameP
                align='left'
                bold={true}
            >
                {`Information missing!`}
            </FlowNodeRowNameP>
        </FlowNodeNameWrapper>
    );
}