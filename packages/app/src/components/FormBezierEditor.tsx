import { mat4, vec4 } from 'gl-matrix';
import React, { useEffect, useMemo, useRef } from 'react';
import styled from 'styled-components';
import { GNODE_ROW_UNIT_HEIGHT } from '../styles/GeometryRowDiv';
import { BOX_SHADOW, INSET_SHADOW } from '../styles/utils';
import { DataTypeValueTypes, Vec2 } from '../types';

export const BEZIER_WIDTH_PIXELS = 260;
export const BEZIER_GRID_UNITS = 8;
const SIZE = GNODE_ROW_UNIT_HEIGHT * BEZIER_GRID_UNITS;
const CANVAS_WIDTH = SIZE;
const CANVAS_HEIGHT = SIZE;
const TENTH = SIZE / 10.0;

const BezierEditorDiv = styled.div`
    grid-row: 1 / ${BEZIER_GRID_UNITS + 1};
    display: grid;
    justify-items: center;
`;

const CanvasWrapperDiv = styled.div`
    position: relative;
    width: ${CANVAS_WIDTH}px;
    height: ${CANVAS_HEIGHT}px;

    background-color: #e3e3e3;

    ${INSET_SHADOW}

    background-size: ${TENTH}px ${TENTH}px;
    background-image:
        linear-gradient(to right, #ccc 1px, transparent 1px),
        linear-gradient(to bottom, #ccc 1px, transparent 1px);
`;

interface HandleDivProps { point: Vec2 };
const HandleDiv = styled.div.attrs<HandleDivProps>(({ point }) => ({
    style: {
        left: `${point.x * CANVAS_WIDTH}px`,
        bottom: `${point.y * CANVAS_HEIGHT}px`,
    }
}))<HandleDivProps>`
    position: absolute;
    transform: translate(-50%, 50%);
    width: 12px;
    aspect-ratio: 1;
    background-color: #aaa;
    border-radius: 100px;
`;

interface Handle {
    index: number;
    point: Vec2;
}

const A_inverse = mat4.transpose(mat4.create(), mat4.fromValues(
    2, -2,  1,  1, 
   -3,  3, -2, -1,
    0,  0,  1,  0,
    1,  0,  0,  0
));

/**
 * Finds degree 3 polynomial which intersects
 * point A and D and is tangential to line AB 
 * and CD at A and D respectively.
 */
function generateBezier(handles: Handle[]) {
    const {         y: A_y } = handles[0].point;
    const { x: B_x, y: B_y } = handles[1].point;
    const { x: C_x, y: C_y } = handles[2].point;
    const {         y: D_y } = handles[3].point;

    const m_0 = (B_y - A_y) / B_x;        // derivative at x=0
    const m_1 = (D_y - C_y) / (1. - C_x); // derivative at x=1

    debugger

    const b = vec4.fromValues(A_y, D_y, m_0, m_1);
    const x = vec4.transformMat4(vec4.create(), b, A_inverse);
    
    // polynomial is solution of system of equations
    const [ c3, c2, c1, c0 ] = x;
    console.log(c3, c2, c1, c0);
    
    return (t: number) => c3*t*t*t + c2*t*t + c1*t + c0;
}

interface Props {
    value: DataTypeValueTypes['mat3'];
    onChange: (newValue: DataTypeValueTypes['mat3'], actionToken: string) => void;
}

const FormBezierEditor = ({ value, onChange }: Props) => {
    // const canvasRef = useRef<HTMLCanvasElement>(null);
    // const ctxRef = useRef<CanvasRenderingContext2D>();

    const handles: Handle[] = [];
    for (let i = 0; i < 4; i++) {
        handles.push({ 
            index: i,
            point: {
                x: value[2 * i + 0], 
                y: value[2 * i + 1] 
            }
        });
    }

    // // INIT CANVAS
    // useEffect(() => {
    //     const canvas = canvasRef.current;
    //     if (!canvas) return;
    //     canvas.width = CANVAS_WIDTH;
    //     canvas.height = CANVAS_HEIGHT;
    //     ctxRef.current = canvas.getContext('2d')!;
    //     // render();
    // }, []);

    // RENDER CURVE
    const svgPath = useMemo(() => {
        const A = handles[0].point;
        const B = handles[1].point;
        const C = handles[2].point;
        const D = handles[3].point;
        return (
                `M ${   0 * CANVAS_WIDTH } ${ (1 - A.y) * CANVAS_HEIGHT } `
            +   `C ${ B.x * CANVAS_WIDTH } ${ (1 - B.y) * CANVAS_HEIGHT } `
            +   `, ${ C.x * CANVAS_WIDTH } ${ (1 - C.y) * CANVAS_HEIGHT } `
            +   `, ${   1 * CANVAS_WIDTH } ${ (1 - D.y) * CANVAS_HEIGHT } `
        );
    }, [ handles ]);

    // useEffect(() => {
    //     const ctx = ctxRef.current;
    //     if (!ctx) return;
    //     ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    //     const bezier = generateBezier(handles);
    //     ctx.beginPath();
    //     ctx.moveTo(0, CANVAS_HEIGHT * (1. - bezier(0)));
    //     for (let x = 1; x < CANVAS_WIDTH; x++) {
    //         const y = bezier(x / CANVAS_WIDTH);
    //         ctx.lineTo(x, CANVAS_HEIGHT * (1. - y));
    //     }
    //     ctx.strokeStyle = 'black';
    //     ctx.stroke();
    // }, [ value ]);

    return (
        <BezierEditorDiv>
            <CanvasWrapperDiv>
            <svg width={CANVAS_WIDTH} height={CANVAS_HEIGHT} xmlns="http://www.w3.org/2000/svg">
                <path d={svgPath} stroke="black" strokeWidth='2px' fill="transparent"/>
            </svg>
            {/* <canvas ref={canvasRef}/>  */}
            {
                handles.map(handle => 
                    <HandleDiv key={handle.index} point={handle.point} />    
                )
            }
            </CanvasWrapperDiv>
        </BezierEditorDiv>
    );
}

export default FormBezierEditor;