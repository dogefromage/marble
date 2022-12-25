import { SceneProgram } from "../../types";
import { CodeTemplate } from "./CodeTemplate";
import { generateGeometryMethodCode } from "./generateGeometryMethodCode";
import { FRAG_CODE_TEMPLATE, VERT_CODE_TEMPLATE } from "./shaderTemplates";

export function generateGLSL(sceneProgram: SceneProgram)
{
    const fragCodeTemplate = new CodeTemplate(FRAG_CODE_TEMPLATE);

    /**
     * Includes
     */
    const includedCodeTotal = sceneProgram.includes
        .map(i => i.glslCode)
        .join('\n');
    fragCodeTemplate.replace('%INCLUDED_METHODS%', includedCodeTotal);

    /**
     * Program methods
     */    
    const { methodName, method } = 
        generateGeometryMethodCode(sceneProgram.rootMethod);
    fragCodeTemplate.replace('%COMPILED_GEOMETRIES%', method);

    /**
     * Root
     */
    const rootMethodCall = `return ${methodName}(p);`; // not final
    fragCodeTemplate.replace('%ROOT_GEOMETRY%', rootMethodCall);
    
    const fragCode = fragCodeTemplate.getFinishedCode(/%.*%/);

    // console.log(logCode(fragCode));

    return {
        vertCode: VERT_CODE_TEMPLATE,
        fragCode,
    }
}