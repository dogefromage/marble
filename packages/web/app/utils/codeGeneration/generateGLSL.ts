import { SceneProgram } from "../../types";
import { CodeTemplate } from "./CodeTemplate";
import { generateGeometryMethodCode } from "./generateGeometryMethodCode";
import { FRAG_CODE_TEMPLATE, VERT_CODE_TEMPLATE } from "./shaderTemplates";

export function generateGLSL(sceneProgram: SceneProgram)
{
    const { methodName, method } = 
        generateGeometryMethodCode(sceneProgram);

    const fragCodeTemplate = new CodeTemplate(FRAG_CODE_TEMPLATE);

    const includedCodeTotal = sceneProgram.includedGLSLCode.join('\n');
    fragCodeTemplate.replace('%INCLUDED_METHODS%', includedCodeTotal);

    fragCodeTemplate.replace('%COMPILED_GEOMETRIES%', method);

    const rootMethodCall = `return ${methodName}(p);`; // not final
    fragCodeTemplate.replace('%ROOT_GEOMETRY%', rootMethodCall);
    
    const fragCode = fragCodeTemplate.getFinishedCode(/%.*%/);

    // console.log(fragCode);

    return {
        vertCode: VERT_CODE_TEMPLATE,
        fragCode,
    }
}