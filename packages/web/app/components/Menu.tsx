import React, { useRef } from 'react';
import styled from 'styled-components';
import useClickedOutside from '../hooks/useClickedOutside';
import { Point } from '../types';

interface MenuWrapperProps
{
    position: Point;
}

const MenuWrapper = styled.div<MenuWrapperProps>`

    position: fixed;
    left: ${({ position }) => position.x }px;
    top:  ${({ position }) => position.y }px;

    width: 260px;

    padding: 0 0.5rem;

    background-color: white;
    border-radius: 3px;
    box-shadow: 5px 5px #00000066;
`;

interface Props
{
    position: Point;
    onUnfocus: () => void;
    children: React.ReactNode;
}

const Menu = ({ position, onUnfocus, children }: Props) =>
{
    const wrapperRef = useRef<HTMLDivElement>(null);

    useClickedOutside(wrapperRef, onUnfocus);

    return (
        <MenuWrapper
            ref={wrapperRef}
            position={position}
        >
            { children }
        </MenuWrapper>
    );
}

export default Menu;