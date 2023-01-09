import { GeometryProgramMethod } from "../../types";
import { CodeTemplate } from "./CodeTemplate";
import { glsl } from "./glslTag";

const geometryMethodTemplate = glsl`
//////// RUNTIME GENERATED ////////
%RETURN_TYPE% %METHOD_NAME%(%ARGUMENT_LIST%)
{
%METHOD_CODE%
}
`;

export function generateGeometryMethodCode(programMethod: GeometryProgramMethod)
{
    const methodTemplate = new CodeTemplate(geometryMethodTemplate)

    methodTemplate.replace('%RETURN_TYPE%', programMethod.methodReturnType);
    methodTemplate.replace('%METHOD_NAME%', programMethod.methodName);

    const argumentList = programMethod.functionArgs
        .map(arg => arg.dataType + ' ' + arg.token).join(', ');
    methodTemplate.replace('%ARGUMENT_LIST%', argumentList);

    const methodCodeList = programMethod.programInstructions;

    const methodCodeString = methodCodeList
        .map(line => `\t${line}`)
        .join(`\n`);

    methodTemplate.replace('%METHOD_CODE%', methodCodeString);

    const method = methodTemplate.getFinishedCode(/%.*%/)

    // console.log(method);

    return {
        method,
        methodName: programMethod.methodName,
    };
}
