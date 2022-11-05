import { DataTypes, ProgramOperation, ProgramOperationTypes, SceneProgram } from "../../types";
import { CodeTemplate } from "./CodeTemplate";
import { formatValueGLSL, textureLookupDatatype } from "./formatValue";
import { generateBinaryInvocationTree } from "./generateBinaryInvocationTree";
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
        const opCode = generateOperationCode(op);
        methodCodeList.push(opCode);
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


function generateOperationCode(op: ProgramOperation)
{
    if (op.type === ProgramOperationTypes.BinaryArithmetic)
    {
        const { type_output, var_output, var_lhs, operation, var_rhs } = op;
        return `${type_output} ${var_output} = ${var_lhs} ${operation} ${var_rhs};`;
    }
    if (op.type === ProgramOperationTypes.Invocation)
    {
        const { type_output, var_output, var_args, name_function } = op;

        const argList = var_args.join(', ');

        return `${type_output} ${var_output} = ${name_function}(${argList});`;
    }
    if (op.type === ProgramOperationTypes.InvocationTree)
    {
        const { type_output, var_output, var_args, name_function, zero_value } = op;

        let rhs = formatValueGLSL(zero_value, type_output);

        if (var_args.length > 0)
        {
            rhs = generateBinaryInvocationTree(name_function, var_args);
        }

        return `${type_output} ${var_output} = ${rhs};`;
    }
    if (op.type === ProgramOperationTypes.Return)
    {
        const { var_input } = op;
        return `return ${var_input};`;
    }

    throw new Error(`Operation not found`);
}