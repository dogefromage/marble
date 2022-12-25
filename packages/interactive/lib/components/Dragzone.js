import React from 'react';
import ReactDOM from 'react-dom';
import styled from 'styled-components';
const DragzoneDiv = styled.div `
    transform: initial;
    position: fixed;
    left: 0;
    top: 0;
    width: 100vw;
    height: 100vh;
    z-index: 6969;

    cursor: ${({ cursor }) => cursor || 'inherit'};
`;
export const Dragzone = (props) => {
    return ReactDOM.createPortal(React.createElement(DragzoneDiv, Object.assign({}, props)), document.querySelector(`#dragzone-portal-mount`));
};
//# sourceMappingURL=Dragzone.js.map