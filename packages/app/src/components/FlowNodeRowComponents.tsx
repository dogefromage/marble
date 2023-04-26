import { InputRowSignature, ListInputRowSignature, OutputRowSignature, RowContext, SimpleInputRowSignature, TypeSpecifier, VariableInputRowSignature } from "@marble/language";
import React, { useEffect, useState } from "react";
import { FlowNodeRowNameP } from "../styles/flowStyles";
import { DataTypes, Vec2 } from "../types";
import FlowJoint from "./FlowJoint";
import FlowNodeRow from "./FlowNodeRow";
import FlowNodeRowInitializer from "./FlowNodeRowInitializer";

function getDataTypeLiteral(specifier: TypeSpecifier): DataTypes {
    if (specifier.type === 'primitive') {
        return specifier.primitive as DataTypes;
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
        <FlowNodeRow
            context={context}
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
            <FlowNodeRowNameP
                align='right'
            >
                {row.label}
            </FlowNodeRowNameP>
        </FlowNodeRow>
    );
}

export const FlowInputRowSwitch = (props: RowComponentProps<InputRowSignature>) => {
    switch (props.row.rowType) {
        case 'input-simple':
            return <FlowInputRowSimple {...props as RowComponentProps<SimpleInputRowSignature>} />
        case 'input-variable':
            return <FlowInputRowVariable {...props as RowComponentProps<VariableInputRowSignature>} />
        case 'input-list':
            return <FlowInputRowList {...props as RowComponentProps<ListInputRowSignature>} />
        default:
            console.error(`unknown row type ${(props.row as any).rowType}`);
            return null;
    }
}

export const FlowInputRowSimple = (props: RowComponentProps<SimpleInputRowSignature>) => {
    const { panelId, flowId, nodeId, row, getClientNodePos, context } = props;
    const dataTypeLiteral = getDataTypeLiteral(row.dataType);

    return (
        <FlowNodeRow
            context={context}
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
            <FlowNodeRowNameP
                align='left'
            >
                {row.label}
            </FlowNodeRowNameP>
        </FlowNodeRow>
    );
}

export const FlowInputRowVariable = (props: RowComponentProps<VariableInputRowSignature>) => {
    const { panelId, flowId, nodeId, row, getClientNodePos, context } = props;
    const dataTypeLiteral = getDataTypeLiteral(row.dataType);

    return (
        <FlowNodeRow context={context}>
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
            <FlowNodeRowInitializer
                flowId={flowId}
                nodeId={nodeId}
                row={row}
                context={context}
            />
        </FlowNodeRow >
    );
}

export const FlowInputRowList = (props: RowComponentProps<ListInputRowSignature>) => {
    const { panelId, flowId, nodeId, row, getClientNodePos, context } = props;
    const dataTypeLiteral = getDataTypeLiteral(row.dataType);

    return (
        <FlowNodeRow context={context}>
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
            <FlowNodeRowNameP
                align='left'
            >
                {row.label}
            </FlowNodeRowNameP>
        </FlowNodeRow>
    );
}

