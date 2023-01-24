import styled from "styled-components";
import GeometryRowDiv from "./GeometryRowDiv";
import GeometryRowNameP from "./GeometryRowNameP";
import { BORDER_RADIUS_TOP } from "./utils";

interface WrapperProps
{
    backColor: string;
}

export const GeometryNodeNameWrapper = styled(GeometryRowDiv)<WrapperProps>`
    background-color: ${({ backColor }) => backColor };
    color: white;

    ${BORDER_RADIUS_TOP}

    margin: 0;
    padding: 0 8px;
`;

export const GeometryNodeTitle = styled(GeometryRowNameP)`
    
    font-weight: bold;
    
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
`