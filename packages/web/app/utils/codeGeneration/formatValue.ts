import { DataTypes, RowValue } from "../../types";


export function formatValueGLSL(value: RowValue, dataType: DataTypes): string
{
    if (dataType === DataTypes.Vec3)
    {
        const values = (value as number[])
            .map(v => formatValueGLSL(v, DataTypes.Float));
        return `vec3(${values.join(', ')})`
    }
    if (dataType === DataTypes.Float)
    {
        const str = value.toString();
        if (/\./.test(str)) 
            return str;
        return `${str}.`;
    }

    throw new Error(`Cannot convert dataType "${dataType}" to GLSL value`);
}