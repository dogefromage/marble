import React from 'react';
import styled from 'styled-components';

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

const MenuItemText = styled.p`

    margin: 0;
    padding: 0 0.5rem;
    
    width: 100%;
    min-width: fit-content;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
`;

const MenuItemInfo = styled(MenuItemText)`

    width: fit-content;
    opacity: 0.7;

    overflow: hidden;
`;

interface Props
{
    text: string;
    info?: string;
    onClick: (e: React.MouseEvent) => void;
}

const MenuItem = ({ text, info, onClick }: Props) =>
{
    return (
        <MenuItemDiv
            onClick={onClick}
        >
            <MenuItemText>{ text }</MenuItemText>
            { 
                info && 
                <MenuItemInfo>{ info }</MenuItemInfo>
            }
        </MenuItemDiv>
    );
}

export default MenuItem;