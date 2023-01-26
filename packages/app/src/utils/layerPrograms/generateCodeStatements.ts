import { DataTypes, OutputRowT, DataTypeValueTypes, textureVarDatatypeSize, Tuple } from "../../types";
import { TEXTURE_LOOKUP_METHOD_NAME } from "../../content/shaderTemplates";

export function formatLiteral(value: DataTypeValueTypes[ DataTypes ], dataType: DataTypes): string {
    if (dataType === 'float') {
        const str = value.toString();
        if (/\./.test(str))
            return str;
        return `${str}.`;
    }

    if (dataType === 'vec2' ||
        dataType === 'vec3' ||
        dataType === 'mat3') {
        const values = (value as number[])
            .map(v => formatLiteral(v, 'float'));

        return `${dataType}(${values.join(',')})`;
    }

    if (dataType === 'Solid') {
        const values = (value as number[]);
        const dist = formatLiteral(values[ 0 ], 'float');
        const color = formatLiteral(values.slice(1) as Tuple<number, 3>, 'vec3');
        return `${'Solid'}(${dist}, ${color})`;
    }

    throw new Error(`Cannot convert dataType "${dataType}" to GLSL value`);
}

function formatTextureLookup(textureCoordinate: number, dataType: DataTypes): string {
    if (dataType === 'float') {
        return `${TEXTURE_LOOKUP_METHOD_NAME}(${textureCoordinate})`;
    }

    if (dataType === 'vec2' ||
        dataType === 'vec3' ||
        dataType === 'mat3') {
        const count = textureVarDatatypeSize[ dataType ];

        const coords: number[] = [];
        for (let i = 0; i < count; i++)
            coords.push(textureCoordinate + i);

        const dataTypeParams = coords
            .map(c => formatTextureLookup(c, 'float'))
            .join(', ');

        return `${dataType}(${dataTypeParams})`;
    }

    if (dataType === 'Solid') {
        const lookupDist = formatTextureLookup(textureCoordinate, 'float');
        const lookupCol = formatTextureLookup(textureCoordinate + 1, 'vec3');
        return `${'Solid'}(${lookupDist}, ${lookupCol})`;
    }

    throw new Error(`Cannot lookup texture for dataType "${dataType}"`);
}

export function formatTextureLookupStatement(identifier: string, textureCoordinate: number, dataType: DataTypes) {
    return `${dataType} ${identifier} = ${formatTextureLookup(textureCoordinate, dataType)};`;
}

export function generateStackedExpression(func: string, identifier: string, defaultLiteral: string) {
    return `${func}(${defaultLiteral}, ${identifier})`;
}

export function createReturntypePlaceholder(outputs: OutputRowT[]) {
    if (outputs.length === 0) return 'void';
    if (outputs.length === 1) return outputs[0].dataType;

    const outputTypesString = outputs
        .map(out => out.dataType)
        .join(', ');

    return `TuplePlaceholder<${outputTypesString}>`
}