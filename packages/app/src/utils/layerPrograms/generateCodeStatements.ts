import { LiteralNode } from "@shaderfrog/glsl-parser/ast";
import { TEXTURE_LOOKUP_METHOD_NAME } from "../../content/shaderTemplates";
import { dataTypeDescriptors, DataTypes, DataTypeValueTypes, initialDataTypeValue, OutputRowT, textureVarDatatypeSize } from "../../types";
import AstUtils from "./AstUtils";

function formatGlslFloat(value: number): LiteralNode {
    const str = value.toString();
    const floatLiteral = /\./.test(str) ? str : `${str}.`;
    return AstUtils.createLiteral(floatLiteral, '');
}

export function parseValue(dataType: DataTypes, value: DataTypeValueTypes[ DataTypes ]): any /* TODO type */ {
    const descriptor = dataTypeDescriptors[dataType];
    if (descriptor.type === 'simple') {
        if (Array.isArray(value)) {
            const numberArray = value as number[];
            const paramList = numberArray.map(num => formatGlslFloat(num));
            return (
                AstUtils.createFunctionCall(
                    AstUtils.createTypeSpecifierNode(
                        AstUtils.createKeyword(descriptor.keyword, '')
                    ),
                    AstUtils.placeCommas(
                        paramList
                    )
                )
            );
        } else {
            if (!isFinite(value!)) {
                throw new Error(`Value is not finite`);
            }
            return formatGlslFloat(value as number);
        }
    }
    if (descriptor.type === 'struct') {
        if (!Array.isArray(value)) {
            throw new Error(`Struct value must be array`);
        }
        const { identifier, attributes } = descriptor;
        const args = attributes.map((dt, index) => parseValue(dt, value[index]));
        return (
            AstUtils.createFunctionCall(
                AstUtils.createTypeSpecifierNode(
                    AstUtils.createIdentifier(identifier, '')
                ), 
                AstUtils.placeCommas(
                    args
                )
            )
        );
    }
    if (descriptor.type === 'lambda') {
        if (value != null) {
            throw new Error(`Lambda values not implemented`);
        }
        const { returnType, parameterTypes } = descriptor;
        const bodyExpression = parseValue(returnType, initialDataTypeValue[returnType]);

        return (
            AstUtils.createLambdaExpression(
                'generated', 
                parameterTypes.map((keyword, index) =>
                    AstUtils.createParameterDeclaration(
                        AstUtils.createTypeSpecifierNode(
                            AstUtils.createKeyword(keyword)
                        ),
                        AstUtils.createIdentifier(`_${index}`)
                    )
                ),
                bodyExpression,
            )
        );
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

    if (dataType === 'SignedDistance') {
        const lookupDist = formatTextureLookup(textureCoordinate, 'float');
        const lookupCol = formatTextureLookup(textureCoordinate + 1, 'vec3');
        return `${'SignedDistance'}(${lookupDist}, ${lookupCol})`;
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

export function generateStructureIdentifier(typeList: string[]) {
    if (!typeList.length) {
        throw new Error(`Cannot make emptry structure`);
    }
    let struct = '';
    for (const name of typeList) {
        const upperCased = name.charAt(0).toUpperCase() + name.slice(1);
        struct += upperCased;
    }
    return struct;
}

export function getStructurePropertyKey(index: number) {
    if (index >= 26) {
        throw new Error(`maximum properties reached`);
    }
    const charCodeIndex = 'a'.charCodeAt(0) + index;
    return String.fromCharCode(charCodeIndex);
}

export function generateStructureDefinition(typeList: string[]) {
    const identifier = generateStructureIdentifier(typeList);
    const propertyList = typeList.map((typeName, index) => {
        return `    ${typeName} ${getStructurePropertyKey(index)};\n`;
    });
    const block = `struct ${identifier} {\n${propertyList.join('')}};`;
    return block;
}

export function formatDataTypeText(dataType: DataTypes): string {
    const descriptor = dataTypeDescriptors[dataType];
    if (descriptor.type === 'simple') {
        return descriptor.keyword;
    }
    if (descriptor.type === 'lambda') {
        // Solid:(vec3)
        const { returnType, parameterTypes } = descriptor;
        return `${returnType}:(${parameterTypes.join(',')})`
    }
    throw new Error(`Type not found`);
}