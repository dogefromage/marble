import React, { ReactNode, useMemo, useRef, useState } from 'react';
import styled from 'styled-components';
import { v4 as uuidv4 } from 'uuid';
import MaterialSymbol from '../styles/MaterialSymbol';
import { BORDER_RADIUS } from '../styles/utils';
import { ButtonMenuElement, FloatingMenuShape, ObjMap, Point } from '../types';
import MenuRootFloating from './MenuRootFloating';

const SelectOptionDiv = styled.div<{ disabled?: boolean }>`
    position: relative;
    height: 1.6rem;
    max-height: 100%;

    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 0.3rem;
    
    padding: 0 0.5rem;
    ${BORDER_RADIUS}
    background-color: ${({ theme }) => theme.colors.general.fields};

    cursor: ${({ disabled }) => disabled ? 'not-allowed' : 'pointer' };

    ${({ disabled }) => disabled && `color: #00000066;` }

    p {
        margin: 0;
        overflow: hidden;
        white-space: nowrap;
        text-overflow: ellipsis;
    }
`;

export interface SelectOptionProps {
    value: string;
    options: string[];
    onChange: (newValue: string) => void;
    mapName?: ObjMap<string>;
    className?: string;
    icon?: string;
    disabled?: boolean;
}

const FormSelectOption = ({ className, icon, value, onChange, options, mapName, disabled }: SelectOptionProps) => {
    const [ dropdown, setDropdown ] = useState<{
        menuId: string;
        anchor: Point;
    }>();
    const wrapperRef = useRef<HTMLDivElement>(null);

    const menuShape: FloatingMenuShape = useMemo(() => {
        const noOptionButton: ButtonMenuElement = {
            type: 'button',
            key: 'no-option',
            name: 'No options',
            onClick: () => {},
        }
        const optionButtons = options.map((option, index) => {
            const button: ButtonMenuElement = {
                type: 'button',
                name: mapName?.[ option ] || option,
                key: option,
                tabIndex: 1 + index,
                onClick: e => {
                    onChange(option);
                    setDropdown(undefined);
                    e.stopPropagation();
                }
            };
            return button;
        });

        return {
            type: 'floating',
            list: optionButtons.length ? optionButtons : [ noOptionButton ],
        }
    }, [ options, onChange, mapName ]);

    return (
        <SelectOptionDiv
            className={className}
            onClick={() => {
                if (disabled) return;
                const rect = wrapperRef.current!.getBoundingClientRect();
                setDropdown({
                    menuId: `select-option-menu:${uuidv4()}`,
                    anchor: { x: rect.left, y: rect.top }
                });
            }}
            ref={wrapperRef}
            disabled={disabled}
        >
            <p>{mapName?.[ value ] ?? value}</p>
            {
                dropdown &&
                <MenuRootFloating
                    menuId={dropdown.menuId}
                    menuType={'misc'}
                    shape={menuShape}
                    anchor={dropdown.anchor}
                    onClose={() => setDropdown(undefined)}
                />
            }
            <MaterialSymbol size={20}>{ icon ?? 'expand_more' }</MaterialSymbol>
        </SelectOptionDiv>
    );
}

export default FormSelectOption;