import styled from "styled-components";
import GeometryRowDiv from "./GeometryRowDiv";
import GeometryRowNameP from "./GeometryRowNameP";

interface WrapperProps
{
    backColor: string;
}

export const GeometryNodeNameWrapper = styled(GeometryRowDiv)<WrapperProps>`
    background-color: ${({ backColor }) => backColor };
    color: white;

    border-radius: 3px 3px 0 0;

    margin: 0;
    padding: 0 8px;
`;

export const GeometryNodeTitle = styled(GeometryRowNameP)`
    
    font-weight: bold;
    
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
`