import { detectMapDifference } from "../../hooks/useReactiveMap";
import { LOOKUP_TEXTURE_WIDTH, LayerProgram, ObjMapUndef, Layer } from "../../types";
import GLGizmoProgram from "../gl/GLGizmoProgram";
import GLIndexedBuffer from "../gl/GLIndexedBuffer";
import { GLPipeline } from "../gl/GLPipeline";
import GLTexture from "../gl/GLTexture";
import GLUserLayerProgram from "../gl/GLUserLayerProgram";

function createVarTexture(gl: WebGL2RenderingContext) {
    const tex = gl.createTexture()!;
    gl.bindTexture(gl.TEXTURE_2D, tex);
    gl.texImage2D(
        gl.TEXTURE_2D,
        0,            // level
        gl.R16F, // internal format
        LOOKUP_TEXTURE_WIDTH,
        LOOKUP_TEXTURE_WIDTH,
        0,            // border
        gl.RED, // format
        gl.FLOAT,  // type
        null
    );
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    return new GLTexture(tex);
}

export class ViewportPipeline extends GLPipeline {
    protected renderWhenReady = true;

    private fullScreenQuad: GLIndexedBuffer;
    private varLookupTexture: GLTexture;

    constructor(gl: WebGL2RenderingContext) {
        super(gl);
        // console.log(gl.getSupportedExtensions());

        gl.enable(gl.BLEND);
        gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

        // gl.enable(gl.DEPTH_TEST);
        // gl.depthFunc(gl.LESS);

        this.fullScreenQuad = GLIndexedBuffer.createFullScreenQuad(gl);
        this.varLookupTexture = createVarTexture(gl);

        // gizmos
        const gizmoProgram = new GLGizmoProgram(gl, this.fullScreenQuad);
        this.addProgram(gizmoProgram);
    }

    private createUserProgram(layerProgram: LayerProgram) {
        return new GLUserLayerProgram(
            this.gl,
            layerProgram,
            this.fullScreenQuad,
            this.varLookupTexture
        );
    }
}