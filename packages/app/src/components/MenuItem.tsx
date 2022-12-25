import React from 'react';
import styled from 'styled-components';
import { MenuItemText, MenuItemInfo } from '../styles/MenuItemText';

export const MenuItemDiv = styled.div`
  
    width: 100%;
    height: 30px;
    margin: 3px 0;
    
    border-radius: 3px;

    display: flex;
    align-items: center;
    justify-content: space-between;

    cursor: pointer;

    &:hover
    {
        background-color: #ddd;
    }
`;

interface Props
{
    text?: string;
    info?: string;
    onClick?: (e: React.MouseEvent) => void;
    children?: React.ReactNode;
}

const MenuItem = ({ text, info, onClick, children }: Props) =>
{
    return (
        <MenuItemDiv
            onClick={onClick}
        >
            {
                text && 
                <MenuItemText>{ text }</MenuItemText>
            }
            { 
                info && 
                <MenuItemInfo>{ info }</MenuItemInfo>
            }
            {
                children
            }
        </MenuItemDiv>
    );
}

export default MenuItem;