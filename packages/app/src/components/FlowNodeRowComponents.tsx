import { InputRowSignature, ListInputRowSignature, OutputRowSignature, RowContext, SimpleInputRowSignature, TypeSpecifier, VariableInputRowSignature } from "@marble/language";
import React from "react";
import styled, { css } from "styled-components";
import { FlowNodeRowDiv, FlowNodeRowNameP } from "../styles/flowStyles";
import { DataTypes, Vec2 } from "../types";
import FlowJoint from "./FlowJoint";

function getDataTypeLiteral(specifier: TypeSpecifier): DataTypes {
    if (specifier.type === 'primitive') {
        return specifier.primitive;
    }
    if (specifier.type === 'reference') {
        return specifier.name as DataTypes;
    }
    return 'unknown' as DataTypes;
}

export type RowComponentProps<R extends InputRowSignature | OutputRowSignature> = {
    panelId: string;
    flowId: string;
    nodeId: string;
    row: R;
    context: RowContext | undefined;
    getClientNodePos: () => Vec2;
}

export const FlowOutputRow = (props: RowComponentProps<OutputRowSignature>) => {
    const { panelId, flowId, nodeId, row, getClientNodePos, context } = props;
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

export const FlowInputRowSwitch = (props: RowComponentProps<InputRowSignature>) => {
    switch (props.row.rowType) {
        case 'input-simple':
            return <FlowInputRowSimple {...props as RowComponentProps<SimpleInputRowSignature>}/>
        case 'input-variable':
            return <FlowInputRowVariable {...props as RowComponentProps<VariableInputRowSignature>}/>
        case 'input-list':
            return <FlowInputRowList {...props as RowComponentProps<ListInputRowSignature>}/>
        default:
            console.error(`unknown row type ${(props.row as any).rowType}`);
            return null;
    }
}

export const FlowInputRowSimple = (props: RowComponentProps<SimpleInputRowSignature>) => {
    const { panelId, flowId, nodeId, row, getClientNodePos, context } = props;
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

export const FlowInputRowVariable = (props: RowComponentProps<VariableInputRowSignature>) => {
    const { panelId, flowId, nodeId, row, getClientNodePos, context } = props;
    const dataTypeLiteral = getDataTypeLiteral(row.dataType);

    return (
        <FlowNodeRowDiv
            heightUnits={1}
        >
            {/* <FlowJoint
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
            /> */}
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

export const FlowInputRowList = (props: RowComponentProps<ListInputRowSignature>) => {
    const { panelId, flowId, nodeId, row, getClientNodePos, context } = props;
    const dataTypeLiteral = getDataTypeLiteral(row.dataType);

    return (
        <FlowNodeRowDiv
            heightUnits={1}
        >
            {/* <FlowJoint
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
            /> */}
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
