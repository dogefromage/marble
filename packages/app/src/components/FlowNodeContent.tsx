import { FlowNodeContext, FunctionSignature, InputRowSignature, OutputRowSignature, RowContext, TypeSpecifier } from '@marble/language';
import React from 'react';
import styled, { css } from 'styled-components';
import { FlowNodeNameWrapper, FlowNodeRowDiv, FlowNodeRowNameP } from '../styles/flowStyles';
import { DataTypes, Vec2 } from '../types';
import FlowJoint from './FlowJoint';

function getDataTypeLiteral(specifier: TypeSpecifier): DataTypes {
    if (specifier.type === 'primitive') {
        return specifier.primitive;
    }
    if (specifier.type === 'reference') {
        return specifier.name as DataTypes;
    }
    return 'unknown' as DataTypes;
}

type RowProps<R extends InputRowSignature | OutputRowSignature> = {
    panelId: string;
    flowId: string;
    nodeId: string;
    row: R;
    context: RowContext | undefined;
    getClientNodePos: () => Vec2;
}

const FlowInputRow = ({ panelId, flowId, nodeId, row, context, getClientNodePos }: RowProps<InputRowSignature>) => {
    const dataTypeLiteral = getDataTypeLiteral(row.dataType);

    return (
        <FlowNodeRowDiv
            heightUnits={1}
        >
            <FlowJoint
                panelId={panelId}
                flowId={flowId}
                dataType={dataTypeLiteral}
                location={{
                    direction: 'input',
                    nodeId,
                    jointIndex: 0,
                    rowId: row.id,
                }}
                getClientNodePos={getClientNodePos}
            />
            <FlowProblemTooltip
                context={context}
            >
                <FlowNodeRowNameP
                    align='left'
                >
                    {row.label}
                </FlowNodeRowNameP>
            </FlowProblemTooltip>
        </FlowNodeRowDiv>
    );
}

const FlowOutputRow = ({ panelId, flowId, nodeId, row, context, getClientNodePos }: RowProps<OutputRowSignature>) => {
    const dataTypeLiteral = getDataTypeLiteral(row.dataType);
    return (
        <FlowNodeRowDiv
            heightUnits={1}
        >
            <FlowJoint
                panelId={panelId}
                flowId={flowId}
                dataType={dataTypeLiteral}
                location={{
                    direction: 'output',
                    nodeId,
                    rowId: row.id,
                }}
                getClientNodePos={getClientNodePos}
            />
            <FlowProblemTooltip
                context={context}
            >
                <FlowNodeRowNameP
                    align='right'
                >
                    {row.label}
                </FlowNodeRowNameP>
            </FlowProblemTooltip>
        </FlowNodeRowDiv>
    );
}

const ErrorUnderlineSpan = styled.span<{ hasErrors: boolean }>`
    ${({ hasErrors }) => hasErrors && css`
        position: relative;

        p {
            text-decoration: red wavy underline;
            text-underline-position: auto;
        }

        .error-tooltip {
            position: absolute;
            visibility: hidden;
            width: 120px;
            background-color: black;
            color: #fff;
            text-align: center;
            padding: 5px 0;
            border-radius: 6px;
            z-index: 1;
            top: -5px;
            left: 105%;
        }

        &:hover .error-tooltip {
            visibility: visible;
        }
    `}
`;

const FlowProblemTooltip = ({ context, children }: { context: RowContext | undefined, children: JSX.Element | JSX.Element[] }) => {

    return (
        <ErrorUnderlineSpan
            hasErrors={!!context?.problems.length}
        >
            {children}
            <span className='error-tooltip'>{context?.problems[0]?.type}</span>
        </ErrorUnderlineSpan>
    )
}

interface Props {
    panelId: string;
    flowId: string;
    nodeId: string;
    context: FlowNodeContext;
    signature: FunctionSignature;
    getClientNodePos: () => Vec2;
}

const FlowNodeContent = ({ panelId, flowId, nodeId, context, signature, getClientNodePos }: Props) => {
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
                    key={output.id}
                    panelId={panelId}
                    flowId={flowId}
                    nodeId={nodeId}
                    row={output}
                    context={context.rows[output.id]}
                    getClientNodePos={getClientNodePos}
                />
            )
        }
        {
            signature.inputs.map(input =>
                <FlowInputRow
                    key={input.id}
                    panelId={panelId}
                    flowId={flowId}
                    nodeId={nodeId}
                    row={input}
                    context={context.rows[input.id]}
                    getClientNodePos={getClientNodePos}
                />
            )
        }
    </>);
}

export default FlowNodeContent;