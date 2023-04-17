import { useMouseDrag } from '@marble/interactive';
import React, { useRef, useState } from 'react';
import styled from 'styled-components';
import { v4 as uuidv4 } from 'uuid';
import { useAppDispatch, useAppSelector } from '../redux/hooks';
import { consoleAppendMessage } from '../slices/consoleSlice';
import { selectWorld } from '../slices/worldSlice';
import { BORDER_RADIUS, INSET_SHADOW } from '../styles/utils';
import { Metrics, UnitNames } from '../types/world';
import { Units } from '../utils/formatUnitValues';
import { FLOW_NODE_ROW_HEIGHT } from '../styles/flowStyles';

const SlidableInputDiv = styled.div`
    position: relative;
    width: 100%;
    height: ${FLOW_NODE_ROW_HEIGHT * 0.85}px;
    display: flex;
    align-items: center;

    margin: ${FLOW_NODE_ROW_HEIGHT * 0.15}px 0;

    form,
    input
    {
        width: 100%;
        height: 100%;

        position: absolute;

        left: 0;
        top: 0;
    }
    
    form
    {
        input
        {
            padding: 0 0.5em;
            ${BORDER_RADIUS}
            ${INSET_SHADOW}
            background-color: ${({ theme }) => theme.colors.general.fields };
            border: none;
            outline: none;
            
            text-align: right;

            font-weight: bold;
            font-size: 14px;

            &:focus
            {
                text-align: center;
            }
        }
    }
    
    .name
    {
        position: absolute;
        top: 50%;
        transform: translateY(-50%);
        left: 0.5rem;

        margin: 0;

        pointer-events: none;
        font-size: 16px;

        width: 60%;
        overflow: hidden;
        white-space: nowrap;
        text-overflow: ellipsis;
    }
`;

type Props = {
    value: number;
    onChange: (newValue: number, actionToken?: string) => void;
    name?: string;
    metric?: Metrics;
}

const SlidableInput = ({
    value,
    onChange,
    name,
    metric,
}: Props) => {
    const dispatch = useAppDispatch();

    const inputRef = useRef<HTMLInputElement>(null);
    const [ isWriting, setIsWriting ] = useState(false);
    const [ textValue, setTextValue ] = useState<string>();

    const { unitSystem } = useAppSelector(selectWorld);

    const unitName = unitSystem[ metric! ] as UnitNames | undefined;

    const formatValue = (value: number) => Units.formatNumber(value, unitName);

    const submitText = (e: React.FormEvent) => {
        e.preventDefault();

        if (document.activeElement instanceof HTMLElement)
            document.activeElement.blur();

        setIsWriting(false);

        try {
            const input = inputRef.current?.value || '';
            const parsed = Units.parseInput(input, metric, unitName);
            onChange(parsed);
        }
        catch (e: any) {
            dispatch(consoleAppendMessage({
                text: `Error at evaluating user input: ${e.message}`,
                type: 'error',
            }));
        }
    };

    const startWriting = (e: React.MouseEvent | React.FocusEvent) => {
        e.stopPropagation();
        e.preventDefault();

        setIsWriting(true);
        setTextValue(value.toString());

        inputRef.current?.focus();
        setTimeout(() => inputRef.current?.select(), 0);
    }

    const dragRef = useRef({
        startX: 0,
        startVal: 0,
        actionToken: '',
        ctrl: false,
        shift: false,
    });

    const { handlers, catcher } = useMouseDrag({
        mouseButton: 0,
        start: e => {
            dragRef.current = {
                startX: e.clientX,
                startVal: value,
                actionToken: 'drag_slidable_input.' + uuidv4(),
                shift: e.shiftKey,
                ctrl: e.ctrlKey,
            }

            e.stopPropagation();
            e.preventDefault();
        },
        move: e => {
            const rate = dragRef.current.shift ? 0.01 : 0.1;

            let value =
                dragRef.current.startVal +
                rate * (e.clientX - dragRef.current.startX);

            if (dragRef.current.ctrl) value = Math.round(value);

            onChange(value, dragRef.current.actionToken);
        }
    }, {
        deadzone: 3,
        cursor: 'ew-resize',
    });

    return (
        <SlidableInputDiv>
            <form
                onSubmit={submitText}
            >
                <input
                    ref={inputRef}
                    type='text'
                    value={isWriting ? textValue : formatValue(value)}
                    onChange={e => {
                        setTextValue((e.currentTarget as HTMLInputElement).value);
                    }}
                    {...handlers}
                    onMouseUp={e => {
                        startWriting(e);
                        handlers.onMouseUp(e);
                    }}
                    onFocus={e => startWriting(e)}
                    onBlur={submitText}
                    autoComplete='off'
                    autoCorrect='off'
                    autoSave='off'
                />
            </form>
            {catcher}
            {
                !isWriting && name &&
                <p className='name'>{name}</p>
            }
        </SlidableInputDiv>
    )
}

export default SlidableInput

