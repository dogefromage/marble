import React, { useEffect, useRef, useState } from 'react';
import styled from 'styled-components';
import useClickedOutside from '../hooks/useClickedOutside';
import { Point } from '../types';

interface MenuWrapperProps
{
    position: Point;
    visible: boolean;
    translateUp: boolean;
    center?: boolean;
    width?: number;
}

const MenuWrapper = styled.div<MenuWrapperProps>`

    position: fixed;
    left: ${({ position }) => position.x }px;
    top:  ${({ position }) => position.y }px;

    ${({ translateUp }) => translateUp ? 'transform: translateY(-100%);' : '' }
    ${({ center }) => center ? 'transform: translate(-50%, -50%);' : '' }

    visibility: ${({ visible }) => visible ? 'visible' : 'hidden' };

    width: ${({ width }) => width != null ? width : 320 }px;

    padding: 0 0.5rem;

    background-color: white;
    border-radius: 3px;
    box-shadow: 5px 5px #00000066;

    outline: solid 1px black;
`;

interface Props
{
    position: Point;
    onUnfocus: () => void;
    children: React.ReactNode;
    center?: boolean;
    width?: number;
}

const Menu = ({ position, onUnfocus, children, center, width }: Props) =>
{
    const wrapperRef = useRef<HTMLDivElement>(null);

    const [ visible, setVisible ] = useState(false);
    const [ translateUp, setTranslateUp ] = useState(false);

    useClickedOutside(wrapperRef, onUnfocus);

    useEffect(() =>
    {
        if (!wrapperRef.current) return;

        const boundingRect = wrapperRef.current.getBoundingClientRect();
        if (boundingRect.bottom > window.innerHeight) 
        {
            setTranslateUp(true);
        }
        setVisible(true);
    }, []);

    return (
        <MenuWrapper
            ref={wrapperRef}
            position={position}
            visible={visible}
            translateUp={translateUp}
            center={center}
            width={width}
        >
            { children }
        </MenuWrapper>
    );
}

export default Menu;