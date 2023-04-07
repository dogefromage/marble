import { DataTypes, Vec2 } from "../types";
import styled from 'styled-components';

interface LinkDivProps
{
    dataType: DataTypes;
    A: Vec2;
    B: Vec2;
}

const GeometryLinkDiv = styled.div.attrs<LinkDivProps>(({ A, B, theme, dataType }) =>
{
    const dx = B.x - A.x;
    const dy = B.y - A.y;

    const width = Math.hypot(dx, dy);
    const alpha = Math.atan2(dy, dx);

    return ({
        style:
        {
            width: `calc(${width}px + 2 * var(--radius))`,
            transform: `
                translate(${A.x}px, ${A.y}px) 
                rotate(${alpha}rad)`,
            '--link-color': theme.colors.dataTypes[ dataType ],
        },
    })
})<LinkDivProps>`

    --radius: 2.5px;

    position: absolute;
    top: calc(-1 * var(--radius));
    left: calc(-1 * var(--radius));
    height: calc(2 * var(--radius));
    transform-origin: var(--radius) var(--radius);
    background-color: var(--link-color);
    border-radius: 1000px;

    cursor: pointer;

    &:hover
    {
        --radius: 4px
    }
`;

export default GeometryLinkDiv;