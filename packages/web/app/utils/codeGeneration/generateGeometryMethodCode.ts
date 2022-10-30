import { DataTypes, ProgramOperationTypes, SceneProgram } from "../../types";
import { CodeTemplate } from "./CodeTemplate";
import { formatValueGLSL, textureLookupDatatype } from "./formatValue";
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

    for (const c of sceneProgram.constants)
    {
        const rhs = formatValueGLSL(c.value, c.dataType);
        const line = `${c.dataType} ${c.name} = ${rhs};`
        methodCodeList.push(line);
    }

    for (const tv of sceneProgram.textureVars)
    {
        const rhs = textureLookupDatatype(tv.textureCoordinate, tv.dataType);
        const line = `${tv.dataType} ${tv.name} = ${rhs};`
        methodCodeList.push(line);
    }

    for (const op of sceneProgram.operations)
    {
        if (op.type === ProgramOperationTypes.BinaryArithmetic)
        {
            const { type_output, var_output, var_lhs, operation, var_rhs } = op;
            const line = `${type_output} ${var_output} = ${var_lhs} ${operation} ${var_rhs};`;
            methodCodeList.push(line);
        }
        else if (op.type === ProgramOperationTypes.Invocation)
        {
            const { type_output, var_output, var_args, name_function } = op;

            const argList = var_args.join(', ');

            const line = `${type_output} ${var_output} = ${name_function}(${argList});`;
            methodCodeList.push(line);
        }
        else if (op.type === ProgramOperationTypes.Return)
        {
            const { var_input } = op;
            const line = `return ${var_input};`;
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
