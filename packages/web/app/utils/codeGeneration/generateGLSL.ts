import { SceneProgram } from "../../types";
import { generateGeometryMethodCode } from "./generateGeometryMethodCode";
import { FRAG_CODE_TEMPLATE, VERT_CODE_TEMPLATE } from "./glslCodeTemplates";

export function generateGLSL(sceneProgram: SceneProgram)
{
    const { methodName, method } = 
        generateGeometryMethodCode(sceneProgram);

    let fragCode = FRAG_CODE_TEMPLATE;

    fragCode = fragCode.replace('%INCLUDED_METHODS%', ''); // implement
    fragCode = fragCode.replace('%COMPILED_GEOMETRIES%', method);

    const rootMethodCall = `return ${methodName}(p);`; // not final
    fragCode = fragCode.replace('%ROOT_GEOMETRY%', rootMethodCall);
    
    return {
        vertCode: VERT_CODE_TEMPLATE,
        fragCode,
    }
}