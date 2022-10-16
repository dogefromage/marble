import useResizeObserver from '@react-hook/resize-observer';
import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import styled from 'styled-components';
import ViewportGLProgram from './ViewportGLProgram';

const CanvasWrapperDiv = styled.div`
    
    width: 100%;
    height: 100%;

    position: relative;
    overflow: hidden;

    canvas
    {
        position: absolute;
        top: 0;
        left: 0;
    }
`;

interface Props
{
    panelId: string;
}

const ViewportCanvas = ({ panelId }: Props) =>
{
    const wrapperRef = useRef<HTMLDivElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);

    const [ gl, setGl  ] = useState<WebGL2RenderingContext>();

    const [ error, setError ] = useState<string>()
    const [ size, setSize ] = useState<DOMRectReadOnly>();

    useEffect(() =>
    {
        if (!wrapperRef.current || !canvasRef.current) return;

        let _size = size || wrapperRef.current.getBoundingClientRect();
        if (!size) setSize(_size);

        canvasRef.current.width = _size.width;
        canvasRef.current.height = _size.height;

        const _gl = canvasRef.current.getContext('webgl2');
        if (!_gl)
            return setError('WebGL2 is not supported by your browser :(');

        _gl.getExtension('OES_texture_float');
        
        
        setGl(_gl);
    }, []);
    
    useResizeObserver(wrapperRef, div => setSize(div.contentRect))

    useLayoutEffect(() =>
    {
        if (!size || !canvasRef.current) return;

        canvasRef.current.width = size.width;
        canvasRef.current.height = size.height;

        if (!gl) return;
        gl.viewport(0, 0, size.width, size.height);
        
    }, [ size ]);

    return (
        <CanvasWrapperDiv ref={wrapperRef}>
            <canvas
                ref={canvasRef}
            />
            {
                gl && size && 
                <ViewportGLProgram 
                    gl={gl} 
                    size={size}
                    panelId={panelId}
                />
            }
            {
                error && <h1>error</h1>
            }
        </CanvasWrapperDiv>
    );
}

export default ViewportCanvas;