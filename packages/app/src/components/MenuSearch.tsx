import React, { useEffect, useRef } from 'react';
import { menuStoreSetSearchValue } from '../hooks/useMenuStore';
import { MenuSearchDiv } from '../styles/MenuSearchDiv';
import { MenuStore, SearchMenuElement } from '../types';

interface Props
{
    // value: string;
    // onChange: (newValue: string) => void;
    // placeholder: string;
    // autoFocus?: boolean;
    
    depth: number;
    menuStore: MenuStore;
    element: SearchMenuElement;
}

const MenuSearch = ({ menuStore, element }: Props) =>
{
    const inputRef = useRef<HTMLInputElement>(null);
    useEffect(() =>
    {
        if (!element.autofocus) return;
        setTimeout(() =>
        {
            inputRef.current?.focus();
        }, 50)
    }, [ inputRef ]);

    return (
        <MenuSearchDiv>
            <form
                onSubmit={e => 
                {
                    e.preventDefault();
                }}
            >
                <input 
                    type='text'
                    value={menuStore.state.searchValue}
                    ref={inputRef}
                    onChange={e =>
                    {
                        menuStore.dispatch(menuStoreSetSearchValue({
                            value: (e.currentTarget as HTMLInputElement).value,
                        }));
                    }}
                    placeholder={element.placeholder}
                    autoComplete='off'
                    autoCorrect='off'
                    autoSave='off'
                />
            </form>
        </MenuSearchDiv>
    );
}

export default MenuSearch;