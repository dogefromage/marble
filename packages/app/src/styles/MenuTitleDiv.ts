import styled from "styled-components";

export const MenuTitleDiv = styled.div<{ backColor?: string }>`

    width: calc(100% + 1rem);
    margin: 0 -0.5rem; // ugly hack

    height: 35px;

    border-radius: 3px 3px 0 0;

    background-color: ${({ backColor }) => backColor || '#444' };
    color: white;

    display: flex;
    align-items: center;

    p
    {
        margin: 0;
        padding: 0 1.5rem;
        font-weight: bold;

        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
    }
`;
