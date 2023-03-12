import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { Size } from '../types';
import ViewportProgramRenderer from './ViewportProgramRenderer';

interface Props {
    panelId: string;
    size: Size;
}

const ViewportCanvas = ({ panelId, size }: Props) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [ctx, setCtx] = useState<WebGL2RenderingContext>();

    useEffect(() => {
        if (!canvasRef.current) return;
        canvasRef.current.width = size.w;
        canvasRef.current.height = size.h;
        const _gl = canvasRef.current.getContext('webgl2');
        if (!_gl) {
            throw new Error('WebGL2 is not supported by your browser :(');
        }
        setCtx(_gl);
    }, [canvasRef.current]);

    useLayoutEffect(() => {
        canvasRef.current!.width = size.w;
        canvasRef.current!.height = size.h;
        if (!ctx) return;
        ctx.viewport(0, 0, size.w, size.h);
    }, [size]);

    return (<>
        <canvas
            ref={canvasRef}
        />
        {
            ctx && size &&
            <ViewportProgramRenderer
                gl={ctx}
                size={size}
                panelId={panelId}
            />
        }
    </>);
}

export default ViewportCanvas;