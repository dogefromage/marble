import React from 'react';
import styled from 'styled-components';

export const MenuItemDiv = styled.div`
  
    width: 100%;
    height: 30px;
    margin: 3px 0;
    
    border-radius: 3px;

    display: flex;
    align-items: center;

    p
    {
        margin: 0;
        padding: 0 1rem;
        
        width: 100%;
        overflow: hidden;
        white-space: nowrap;
        text-overflow: ellipsis;

    }

    &:hover
    {
        background-color: #ddd;
    }
`;

interface Props
{
    text: string;
    onClick: (e: React.MouseEvent) => void;
}

const MenuItem = ({ text, onClick }: Props) =>
{
    return (
        <MenuItemDiv
            onClick={onClick}
        >
            <p>{ text }</p>
        </MenuItemDiv>
    );
}

export default MenuItem;