import { mat4, vec3 } from "gl-matrix";


export function raymarching(gl: WebGL2RenderingContext)
{
    const quad = new Float32Array([
        -1,  1,  0,
        -1, -1,  0,
         1, -1,  0,
         1,  1,  0,
    ]);
    
    const indices = new Uint16Array([ 3, 2, 1, 3, 1, 0 ]);

    const vertexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, quad, gl.STATIC_DRAW);

    const indexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices, gl.STATIC_DRAW);



    const vertexShader = gl.createShader(gl.VERTEX_SHADER)!;
    gl.shaderSource(vertexShader, vertexCode);
    gl.compileShader(vertexShader);
    // checkShaderError(gl, vertexShader);

    const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER)!;
    gl.shaderSource(fragmentShader, fragmentCode);
    gl.compileShader(fragmentShader);
    // checkShaderError(gl, fragmentShader);

    const program = gl.createProgram()!;
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);
    gl.useProgram(program);
    


    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer); 
    const positionLocation = gl.getAttribLocation(program, "position");
    gl.vertexAttribPointer(positionLocation, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(positionLocation);

    
    // gl.enable(gl.DEPTH_TEST);
    // gl.viewport(0, 0, 100, 100);

    const uniformLocations =
    {
        inverseCamera: gl.getUniformLocation(program, 'inverseCamera'),
    };

    const untransformedCamera = mat4.perspective(mat4.create(), 1, 1, 0.1, 10);

    const transformedCamera = mat4.clone(untransformedCamera);
    // mat4.rotateX(transformedCamera, transformedCamera, 0.3)
    mat4.translate(transformedCamera, transformedCamera, vec3.fromValues(0, 0, -5));


    function animate()
    {
        requestAnimationFrame(animate);

        mat4.translate(transformedCamera, transformedCamera, vec3.fromValues(0, 0, -.05));
    
        const inverseCamera = mat4.clone(transformedCamera);
        mat4.invert(inverseCamera, inverseCamera);
        gl.uniformMatrix4fv(uniformLocations.inverseCamera, false, inverseCamera);
        
        gl.drawElements(gl.TRIANGLES, indices.length, gl.UNSIGNED_SHORT, 0);
    }
    requestAnimationFrame(animate);
}















// function glTutorial(gl: WebGL2RenderingContext)
// {
//     const vertexData = [
//         0, 1, 0,
//         1, -1, 0,
//         -1, -1, 0,
//     ];

//     const positionBuffer = gl.createBuffer();
//     gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
//     gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertexData), gl.STATIC_DRAW);

//     const colorBuffer = gl.createBuffer();
//     gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
//     gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colorData), gl.STATIC_DRAW);

//     const vertexShader = gl.createShader(gl.VERTEX_SHADER)!;
//     gl.shaderSource(vertexShader, glsl`
//     precision mediump float;

//     attribute vec3 position;
//     attribute vec3 color;
//     varying vec3 fragColor;

//     uniform mat4 matrix;

//     void main()
//     {
//         gl_Position = matrix * vec4(position, 1.0);
//         fragColor = color;
//     }
//     `);
//     gl.compileShader(vertexShader);
//     checkShaderError(gl, vertexShader);

//     const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER)!;
//     gl.shaderSource(fragmentShader, `
//     precision mediump float;
//     varying vec3 fragColor;
//     void main()
//     {
//         gl_FragColor = vec4(fragColor, 1);
//         // gl_FragColor = vec4(1, 0, 0, 1);
//     }
//     `);
//     gl.compileShader(fragmentShader);
//     checkShaderError(gl, fragmentShader);
    
//     if (!gl.getShaderParameter(fragmentShader, gl.COMPILE_STATUS)) 
//     {
//         console.error(gl.getShaderInfoLog(fragmentShader));
//     }

//     const program = gl.createProgram()!;
//     gl.attachShader(program, vertexShader);
//     gl.attachShader(program, fragmentShader);
//     gl.linkProgram(program);

//     const positionLocation = gl.getAttribLocation(program, 'position');
//     gl.enableVertexAttribArray(positionLocation);
//     gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
//     gl.vertexAttribPointer(positionLocation, 3, gl.FLOAT, false, 0, 0);

//     const colorLocation = gl.getAttribLocation(program, 'color');
//     gl.enableVertexAttribArray(colorLocation);
//     gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
//     gl.vertexAttribPointer(colorLocation, 3, gl.FLOAT, false, 0, 0);

//     gl.useProgram(program);

//     const uniformLocations =
//     {
//         matrix: gl.getUniformLocation(program, 'matrix'),
//     };
//     const matrix = [
//         0.8, 0, 0, 0,
//         0, 0.5, 0, 0,
//         0, 0, 1, 0,
//         0, 0, 0, 1,
//     ];
//     gl.uniformMatrix4fv(uniformLocations.matrix, false, matrix);

//     gl.drawArrays(gl.TRIANGLES, 0, 3);
// }