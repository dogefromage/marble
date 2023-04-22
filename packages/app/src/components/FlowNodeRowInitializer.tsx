import { InitializerValue, RowContext, VariableInputRowSignature } from '@marble/language';
import React from 'react';
import { FlowNodeRowNameP } from '../styles/flowStyles';
import SlidableInput from './SlideableInput';
import { useAppDispatch } from '../redux/hooks';
import { flowsSetRowValue } from '../slices/flowsSlice';

interface Props {
    flowId: string;
    nodeId: string;
    row: VariableInputRowSignature;
    context: RowContext | undefined;
}

const FlowNodeRowInitializer = ({ flowId, nodeId, row, context }: Props) => {
    // display value should be set if nothing is connected
    if (context && context.displayValue != null) {
        const { specifier } = context;
        let typeKey = specifier.type;
        if (specifier.type === 'primitive') typeKey += `:${specifier.primitive}`;
        if (specifier.type === 'reference') typeKey += `:${specifier.name}`;

        const props: InitializerProps = {
            flowId, nodeId, rowId: row.id,
            name: row.label,
            value: context.displayValue,
        }

        switch (typeKey) {
            case 'primitive:number':
                return <NumberInitializer {...props} />;
            case 'reference:vec3':
                return <Vec3Initializer {...props} />;
        }
    }

    return (
        <NameRow label={row.label} />
    );
}

export default FlowNodeRowInitializer;


type InitializerProps = {
    flowId: string;
    nodeId: string;
    rowId: string;
    name: string;
    value: InitializerValue;
}

const NumberInitializer = ({ flowId, nodeId, rowId, name, value }: InitializerProps) => {
    const dispatch = useAppDispatch();

    if (typeof value !== 'number') {
        console.error('typeof value must be number');
        return null;
    }

    return (
        <SlidableInput
            name={name}
            value={value}
            onChange={(newValue, actionToken) => {
                dispatch(flowsSetRowValue({
                    flowId, nodeId, rowId,
                    rowValue: newValue,
                    undo: { desc: 'Updated number.', actionToken },
                }))
            }}
        />
    )
}

const Vec3Initializer = ({ flowId, nodeId, rowId, name, value }: InitializerProps) => {
    const dispatch = useAppDispatch();

    const update = (rowValue: InitializerValue, actionToken: string | undefined) => {
        dispatch(flowsSetRowValue({
            flowId, nodeId, rowId,
            rowValue,
            undo: { desc: 'Updated vec3.', actionToken },
        }))
    }

    const vec = value as { x: number, y: number, z: number };
    const { x, y, z } = vec;

    return (<>
        <NameRow label={name} />
        <SlidableInput
            name={'X'}
            value={x}
            onChange={(newX, token) => update({ ...vec, x: newX }, token)}
        />
        <SlidableInput
            name={'Y'}
            value={y}
            onChange={(newY, token) => update({ ...vec, y: newY }, token)}
        />
        <SlidableInput
            name={'Z'}
            value={z}
            onChange={(newZ, token) => update({ ...vec, z: newZ }, token)}
        />
    </>);
}

const NameRow = ({ label }: { label: string }) => (
    <FlowNodeRowNameP align='left'>{label}</FlowNodeRowNameP>
);