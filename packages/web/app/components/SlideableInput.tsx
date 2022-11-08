import { useMouseDrag } from '@marble/interactive';
import React, { useRef, useState } from 'react';
import styled from 'styled-components';
import { v4 as uuidv4 } from 'uuid';
import { GNODE_ROW_UNIT_HEIGHT } from '../styled/GeometryRowDiv';
import { FONT_FAMILY } from '../styled/utils';
import { clamp } from '../utils/math';
import temporaryPushError from '../utils/temporaryPushError';

const SlidableInputDiv = styled.div`

    position: relative;
    width: 100%;
    height: ${GNODE_ROW_UNIT_HEIGHT * 0.7}px;
    display: flex;
    align-items: center;

    margin: ${GNODE_ROW_UNIT_HEIGHT * 0.15}px 0;

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
            border-radius: 3px;
            background-color: #e5e4eb;
            box-shadow: inset 2px 2px #00000033;
            border: none;
            outline: none;
            
            text-align: right;

            font-family: ${FONT_FAMILY};
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
    }
`;

const MAX_VALUE = 1e32;

function formatValue(value: number)
{
    if (typeof value !== 'number' || 
        !isFinite(value)) return 'NaN';

    let precision = value.toPrecision(4);
    let string = value.toString();
    return precision.length > string.length ? string : precision;
}

type Props = 
{
    value: number;
    onChange: (newValue: number, actionToken?: string) => void; 
    name?: string;
}

const SlidableInput = ({
    value,
    onChange,
    name,
}: Props) => 
{
    const inputRef = useRef<HTMLInputElement>(null);
    const [ isWriting, setIsWriting ] = useState(false);
    const [ textValue, setTextValue ] = useState<string>();

    const submitText = (e: React.FormEvent) =>
    {
        e.preventDefault();
        
        if (document.activeElement instanceof HTMLElement)
            document.activeElement.blur();

        setIsWriting(false);

        try
        {
            const evaluatedString = eval(inputRef.current?.value || '');

            let numberValue = clamp(Number.parseFloat(evaluatedString), -MAX_VALUE, MAX_VALUE);
            if (!isFinite(numberValue)) throw new Error(`Not finite`);
            
            onChange(numberValue);
        }
        catch (err)
        {
            temporaryPushError('Error at evaluating user input');
        }
    };

    const startWriting = () =>
    {
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
        deadzone: 3,
        cursor: 'ew-resize',
        start: e =>
        {
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
        move: e =>
        {
            const rate = dragRef.current.shift ? 0.01 : 0.1;

            let value = 
                dragRef.current.startVal +
                rate * (e.clientX - dragRef.current.startX);

            if (dragRef.current.ctrl) value = Math.round(value);

            onChange(value, dragRef.current.actionToken);
        }
    })

    return (
        <SlidableInputDiv>
            <form 
                onSubmit={submitText}
            >
                <input
                    ref={inputRef}
                    type='text'
                    value={isWriting ? textValue : formatValue(value)}
                    onChange={e => 
                    { 
                        setTextValue((e.currentTarget as HTMLInputElement).value); 
                    }}
                    {...handlers}
                    onMouseUp={e =>
                    {
                        startWriting();
                        handlers.onMouseUp(e);
                    }}
                    onFocus={startWriting}
                    onBlur={submitText}
                    autoComplete='off'
                    autoCorrect='off'
                    autoSave='off'
                />
            </form>
            { catcher }
            {
                !isWriting && name &&
                <p className='name'>{ name }</p>
            }
            {
    //             (type === 'range') ?
    //             <div
    //                 className={styles.display}
    //                 style={{ 
    //                     width: `${unlerp(value, min, max) * 100}%`
    //                 }}
    //             />
    //             : null
            }
        </SlidableInputDiv>
    )
}

export default SlidableInput

