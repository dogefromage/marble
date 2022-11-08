import styled from 'styled-components';

interface Props
{
    name: string;
    size: number;
}

const MaterialSymbol = styled.span.attrs(() =>
{
    return {
        className: 'material-symbols-outlined'
    }
})<Props>`

    font-size: ${({ size }) => size }px;
    
    &::after
    {
        display: block;
        content: "${({ name }) => name }";
    }
`;

export default MaterialSymbol;