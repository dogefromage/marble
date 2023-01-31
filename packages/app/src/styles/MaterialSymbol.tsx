import styled from 'styled-components';

interface Props {
    size?: number;
}

const MaterialSymbol = styled.span.attrs<Props>(({ className }) => {
    return {
        className: `${className} material-symbols-outlined`,
    }
})<Props>`
    user-select: none;
    ${({ size }) => size && `font-size: ${size}px;`}
`;

export default MaterialSymbol;