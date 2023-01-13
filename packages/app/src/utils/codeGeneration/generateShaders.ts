import { RenderLayerProgram } from "../../types";
import { CodeTemplate } from "./CodeTemplate";
import { FRAG_CODE_TEMPLATE, VERT_CODE_TEMPLATE } from "../../content/shaderTemplates";

export function generateShaders(sceneProgram: RenderLayerProgram)
{
    const fragCodeTemplate = new CodeTemplate(FRAG_CODE_TEMPLATE);

    const includedCodeTotal = sceneProgram.includes
        .map(i => i.source)
        .join('\n');
    fragCodeTemplate.replace('%INCLUDES%', includedCodeTotal);
    fragCodeTemplate.replace('%MAIN_PROGRAM%', sceneProgram.mainProgramCode);
    fragCodeTemplate.replace('%ROOT_GEOMETRY%', sceneProgram.rootFunctionName);
    
    const fragCode = fragCodeTemplate.getFinishedCode(/%.*%/);

    return {
        vertCode: VERT_CODE_TEMPLATE,
        fragCode,
    };
}