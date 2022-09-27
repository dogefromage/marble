import { SceneProgram } from "../../types";
import { CodeTemplate } from "./CodeTemplate";
import { generateGeometryMethodCode } from "./generateGeometryMethodCode";
import { FRAG_CODE_TEMPLATE, VERT_CODE_TEMPLATE } from "./glslCodeTemplates";

export function generateGLSL(sceneProgram: SceneProgram)
{
    const { methodName, method } = 
        generateGeometryMethodCode(sceneProgram);

    const fragCodeTemplate = new CodeTemplate(FRAG_CODE_TEMPLATE);

    fragCodeTemplate.replace('%INCLUDED_METHODS%', ''); // implement
    fragCodeTemplate.replace('%COMPILED_GEOMETRIES%', method);

    const rootMethodCall = `return ${methodName}(p);`; // not final
    fragCodeTemplate.replace('%ROOT_GEOMETRY%', rootMethodCall);
    
    const fragCode = fragCodeTemplate.getFinishedCode(/%.*%/);

    return {
        vertCode: VERT_CODE_TEMPLATE,
        fragCode,
    }
}