import { FlowNodeContext, FlowSignature } from '@marble/language';
import React from 'react';
import { FlowNodeNameWrapper, FlowNodeRowNameP } from '../styles/flowStyles';
import { Vec2 } from '../types';
import { FlowInputRowSwitch, FlowOutputRow } from './FlowNodeRowComponents';

interface Props {
    panelId: string;
    flowId: string;
    nodeId: string;
    context: FlowNodeContext;
    signature: FlowSignature;
    getClientNodePos: () => Vec2;
}

const FlowNodeContent = ({ panelId, flowId, nodeId, context, signature, getClientNodePos }: Props) => {

    const commonProps = { panelId, flowId, nodeId, getClientNodePos };

    return (<>
        <FlowNodeNameWrapper
            heightUnits={1}
            backColor={signature.attributes.color}
        >
            <FlowNodeRowNameP
                align='left'
                bold={true}
            >
                {signature.name}
            </FlowNodeRowNameP>
        </FlowNodeNameWrapper>
        {
            signature.outputs.map(output =>
                <FlowOutputRow
                    {...commonProps}
                    key={output.id}
                    row={output}
                    context={context.rowContexts[output.id]}
                />
            )
        }
        {
            signature.inputs.map(input =>
                <FlowInputRowSwitch
                    {...commonProps}
                    key={input.id}
                    row={input}
                    context={context.rowContexts[input.id]}
                />
            )
        }
    </>);
}

export default FlowNodeContent;