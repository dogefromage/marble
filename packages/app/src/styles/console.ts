import styled from "styled-components";
import { ConsoleMessageType } from "../types/console";

export const ConsoleDiv = styled.div`
    background-color: black;
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    gap: 5px;
    padding: 5px;
    overflow-y: scroll;
`;

interface ConsoleMessagePProps { 
    type?: ConsoleMessageType; 
}

function getColor(type?: ConsoleMessageType) {
    switch (type) {
        case 'error':
            return '#ed2b5b';
        case 'warning':
            return '#6ed8ff';
    }
    return '#ffffff';
}

export const ConsoleMessageP = styled.p<ConsoleMessagePProps>`
    color: ${({ type }) => getColor(type) };
    font-family: monospace;
    margin: 0;
`;