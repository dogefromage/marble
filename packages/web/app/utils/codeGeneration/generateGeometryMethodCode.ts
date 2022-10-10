import { ProgramOperationTypes, SceneProgram } from "../../types";
import { CodeTemplate } from "./CodeTemplate";
import { formatValueGLSL } from "./formatValue";
import { glsl } from "./glslTag";

const geometryMethodTemplate = glsl`
//////// RUNTIME GENERATED ////////
%RETURN_TYPE% %METHOD_NAME%(%ARGUMENT_LIST%)
{
%METHOD_CODE%
}
`;

export function generateGeometryMethodCode(sceneProgram: SceneProgram)
{
    const methodTemplate = new CodeTemplate(geometryMethodTemplate)

    methodTemplate.replace('%RETURN_TYPE%', sceneProgram.methodReturnType);
    methodTemplate.replace('%METHOD_NAME%', sceneProgram.methodName);

    const argumentList = sceneProgram.functionArgs
        .map(arg => arg.dataType + ' ' + arg.name).join(', ');
    methodTemplate.replace('%ARGUMENT_LIST%', argumentList);

    const methodCodeList: string[] = [];

    for (const { dataType, value, element } of sceneProgram.textureVars)
    {
        const formattedValue = formatValueGLSL(value, dataType);
        const line = `${dataType} ${element} = ${formattedValue};`;
        methodCodeList.push(line);
    }

    for (const op of sceneProgram.operations)
    {
        if (op.type === ProgramOperationTypes.Arithmetic)
        {
            const { outputDatatype, outputElement, lhs, operation, rhs } = op;
            const line = `${outputDatatype} ${outputElement} = ${lhs} ${operation} ${rhs};`;
            methodCodeList.push(line);
        }
        else if (op.type === ProgramOperationTypes.Call)
        {
            const { outputDatatype, outputElement, functionArgs, functionName } = op;

            const argList = functionArgs.join(', ');

            const line = `${outputDatatype} ${outputElement} = ${functionName}(${argList});`;
            methodCodeList.push(line);
        }
        else if (op.type === ProgramOperationTypes.Output)
        {
            const { input } = op;
            const line = `return ${input};`;
            methodCodeList.push(line);
        }
    }

    const methodCodeString = methodCodeList
        .map(line => `\t${line}`)
        .join(`\n`);

    methodTemplate.replace('%METHOD_CODE%', methodCodeString);

    const method = methodTemplate.getFinishedCode(/%.*%/)

    return {
        method,
        methodName: sceneProgram.methodName,
    };
}
