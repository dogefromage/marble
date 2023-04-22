import styled from 'styled-components';

interface Props
{
    rect: { x: number, y: number, w: number, h: number };
}

const MouseSelectionDiv = styled.div.attrs<Props>(({ rect }) =>
{
    return {
        style: {
            '--rect-x': `${rect.x}px`,
            '--rect-y': `${rect.y}px`,
            '--rect-w': `${rect.w}px`,
            '--rect-h': `${rect.h}px`,
        }
    };
})<Props>`
    position: absolute;

    z-index: 100;

    left:   var(--rect-x);
    top:    var(--rect-y);
    width:  var(--rect-w);
    height: var(--rect-h);

    background-color: #ffffff55;
    border: dashed 2px #111;
`;

export default MouseSelectionDiv;