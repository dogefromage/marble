import styled from "styled-components";

export const MenuItemText = styled.p`
    margin: 0;
    padding: 0 0.5rem;

    width: 100%;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
`;


export const MenuItemInfo = styled(MenuItemText)`
    width: fit-content;
    opacity: 0.7;

    overflow: hidden;
`;
