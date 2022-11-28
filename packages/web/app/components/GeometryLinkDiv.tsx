import { DataTypes, Point } from "../types";
import styled from 'styled-components';

interface LinkDivProps
{
    dataType: DataTypes;
    A: Point;
    B: Point;
}

export const LinkDiv = styled.div.attrs<LinkDivProps>(({ A, B, theme, dataType }) =>
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
