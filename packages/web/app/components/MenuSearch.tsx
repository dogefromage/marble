import React, { useEffect, useRef } from 'react';
import styled from 'styled-components';
import { FONT_FAMILY } from '../styled/utils';
import { MenuItemDiv } from './MenuItem';

const MenuSearchDiv = styled(MenuItemDiv)`

    &:hover
    {
        background-color: unset;
    }

    form
    {
        width: 100%;
        height: 100%;

        input
        {
            width: 100%;
            height: 100%;

            outline: none;
            border: none;
            padding: 0 1rem;
            
            border-radius: 3px;

            background-color: #e5e4eb;
            box-shadow: inset 2px 2px #00000033;

            font-weight: normal;
            font-size: 1rem;
            font-family: ${FONT_FAMILY};
        }
    }
`;

interface Props
{
    value: string;
    onChange: (newValue: string) => void;
    onSubmit: (e: React.FormEvent) => void;
    placeholder: string;
    autoFocus?: boolean;
}

const MenuSearch = ({ value, onChange, onSubmit, placeholder, autoFocus }: Props) =>
{
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() =>
    {
        if (!autoFocus) return;

        setTimeout(() =>
        {
            inputRef.current?.focus();
        }, 50)
    }, [ inputRef ])

    return (
        <MenuSearchDiv>
            <form
                onSubmit={e => 
                {
                    e.preventDefault();
                    onSubmit(e);
                }}
            >
                <input 
                    type='text'
                    value={value}
                    ref={inputRef}
                    onChange={e =>
                    {
                        onChange((e.currentTarget as HTMLInputElement).value);
                    }}
                    placeholder={placeholder}
                    autoComplete='off'
                    autoCorrect='off'
                    autoSave='off'
                />
            </form>
        </MenuSearchDiv>
    );
}

export default MenuSearch;