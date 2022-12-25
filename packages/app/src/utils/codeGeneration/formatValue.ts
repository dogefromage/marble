import { DataTypes, RowValueMap, TEXTURE_VAR_DATATYPE_SIZE, Tuple } from "../../types";
import { TEXTURE_LOOKUP_METHOD_NAME } from "./shaderTemplates";


export function formatValueGLSL(value: RowValueMap[DataTypes], dataType: DataTypes): string
{
    if (dataType === DataTypes.Float)
    {
        const str = value.toString();
        if (/\./.test(str)) 
            return str;
        return `${str}.`;
    }

    if (dataType === DataTypes.Vec2 ||
        dataType === DataTypes.Vec3 ||
        dataType === DataTypes.Mat3)
    {
        const values = (value as number[])
            .map(v => formatValueGLSL(v, DataTypes.Float));

        return `${dataType}(${values.join(',')})`;
    }
    
    if (dataType === DataTypes.Solid)
    {
        const values = (value as number[]);
        const dist = formatValueGLSL(values[0], DataTypes.Float);
        const color = formatValueGLSL(values.slice(1) as Tuple<number, 3>, DataTypes.Vec3);
        return `${DataTypes.Solid}(${dist}, ${color})`;
    }

    throw new Error(`Cannot convert dataType "${dataType}" to GLSL value`);
}

export function textureLookupDatatype(textureCoordinate: number, dataType: DataTypes): string
{
    if (dataType === DataTypes.Float)
    {
        return `${TEXTURE_LOOKUP_METHOD_NAME}(${textureCoordinate})`;
    }

    if (dataType === DataTypes.Vec2 ||
        dataType === DataTypes.Vec3 ||
        dataType === DataTypes.Mat3)
    {
        const count = TEXTURE_VAR_DATATYPE_SIZE[dataType];

        const coords: number[] = [];
        for (let i = 0; i < count; i++)
            coords.push(textureCoordinate + i);

        const dataTypeParams = coords
            .map(c => textureLookupDatatype(c, DataTypes.Float))
            .join(', ');

        return `${dataType}(${dataTypeParams})`;
    }

    if (dataType === DataTypes.Solid)
    {
        const lookupDist = textureLookupDatatype(textureCoordinate, DataTypes.Float);
        const lookupCol = textureLookupDatatype(textureCoordinate + 1, DataTypes.Vec3);
        return `${DataTypes.Solid}(${lookupDist}, ${lookupCol})`;
    }

    throw new Error(`Cannot lookup texture for dataType "${dataType}"`);
}