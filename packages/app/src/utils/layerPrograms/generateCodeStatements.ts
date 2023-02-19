import { ExpressionNode, FunctionCallNode, LambdaTypeSpecifierNode, LiteralNode, SimpleTypeSpecifierNode, TypeSpecifierNode } from "@marble/language";
import { TEXTURE_LOOKUP_METHOD_NAME } from "../../content/shaderTemplates";
import { dataTypeDescriptors, DataTypes, DataTypeValueTypes, initialDataTypeValue, textureVarDatatypeSize } from "../../types";
import { arrayRange } from "../arrays";
import ast from "./AstUtils";

function formatGlslFloat(value: number): LiteralNode {
    const str = value.toString();
    const floatLiteral = /\./.test(str) ? str : `${str}.`;
    return ast.createLiteral(floatLiteral, '');
}

export function parseValue(dataType: DataTypes, value: DataTypeValueTypes[DataTypes]): any /* TODO type */ {
    const descriptor = dataTypeDescriptors[dataType];
    if (descriptor.type === 'simple') {
        if (Array.isArray(value)) {
            const numberArray = value as number[];
            const paramList = numberArray.map(num => formatGlslFloat(num));
            return (
                ast.createFunctionCall(
                    ast.createTypeSpecifierNode(
                        ast.createKeyword(descriptor.keyword, '')
                    ),
                    paramList
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
            ast.createFunctionCall(
                ast.createTypeSpecifierNode(
                    ast.createIdentifier(identifier, '')
                ),
                args,
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
            ast.createLambdaExpression(
                'generated',
                parameterTypes.map((keyword, index) =>
                    ast.createParameterDeclaration(
                        ast.createTypeSpecifierNode(
                            ast.createKeyword(keyword)
                        ),
                        ast.createIdentifier(`_${index}`)
                    )
                ),
                bodyExpression,
            )
        );
    }
    throw new Error(`Cannot convert dataType "${dataType}" to GLSL value`);
}

export function parseDataType(dataType: DataTypes): TypeSpecifierNode | LambdaTypeSpecifierNode {
    const descriptor = dataTypeDescriptors[dataType];
    if (descriptor.type === 'simple') {
        const { keyword } = descriptor;
        return (
            ast.createTypeSpecifierNode(
                ast.createKeyword(
                    keyword
                )
            )
        );
    } else if (descriptor.type === 'struct') {
        const { identifier } = descriptor;
        return (
            ast.createTypeSpecifierNode(
                ast.createIdentifier(
                    identifier
                )
            )
        );
    } else if (descriptor.type === 'lambda') {
        const { returnType, parameterTypes } = descriptor;
        const returnTypeSpec = parseDataType(returnType) as SimpleTypeSpecifierNode;
        const argSpecs = parameterTypes.map(param => parseDataType(param)) as SimpleTypeSpecifierNode[];
        return ast.createLambdaTypeSpecifier(returnTypeSpec, argSpecs);
    }
    throw new Error(`Unknown datatype "${dataType}"`);
}

function generateLookupCall(textureCoordinate: number): FunctionCallNode {
    return ast.createFunctionCall(
        ast.createTypeSpecifierNode(
            ast.createIdentifier(TEXTURE_LOOKUP_METHOD_NAME),
        ), [
            ast.createLiteral(Math.floor(textureCoordinate).toString())
        ]
    )
}

function generateTextureLookup(textureCoordinate: number, dataType: DataTypes): ExpressionNode {
    const descriptor = dataTypeDescriptors[dataType];
    if (descriptor.type === 'simple') {
        const { keyword } = descriptor;
        switch (keyword) {
            case 'float':
                return generateLookupCall(textureCoordinate);
            case 'vec2':
            case 'vec3':
            case 'vec4':
            case 'mat3':
                const size = textureVarDatatypeSize[dataType];
                const lookups = arrayRange(size)
                    .map(index => generateLookupCall(textureCoordinate + index));
                return ast.createFunctionCall(
                    parseDataType(dataType),
                    lookups,
                );
            default: 
                throw new Error(`Unknown keyword "${keyword}"`);
        }
    } else if (descriptor.type === 'struct') {
        throw new Error(`Lookup for struct not supported`);
        // const { attributes } = descriptor;
        // const args: ExpressionNode[] = [];
        // for (let i = 0; i < attributes.length; i++) {
        //     const attributeType = attributes[i];
        //     args.push(generateTextureLookup(textureCoordinate, attributeType));
        //     textureCoordinate += textureVarDatatypeSize[attributeType]
        // }
        // return ast.createFunctionCall(
        //     parseDataType(dataType),
        //     args
        // );
    } else if (descriptor.type === 'lambda') {
        throw new Error(`Lookup for lambda not supported`);
    } else {
        throw new Error(`Unknown type category "${(descriptor as any).type}"`);
    }
}

export function generateTextureLookupStatement(identifier: string, textureCoordinate: number, dataType: DataTypes) {
    const declaration = ast.createDeclaration(
        identifier,
        generateTextureLookup(textureCoordinate, dataType),
    )
    const declarationStatement = ast.createDeclarationStatement(
        ast.createFullySpecifiedType(
            parseDataType(dataType)
        ),
        declaration,
    );
    return [ declaration, declarationStatement ] as const;
}

// export function generateStackedExpression(func: string, identifier: string, defaultLiteral: string) {
//     return `${func}(${defaultLiteral}, ${identifier})`;
// }

// export function createReturntypePlaceholder(outputs: OutputRowT[]) {
//     if (outputs.length === 0) return 'void';
//     if (outputs.length === 1) return outputs[0].dataType;

//     const outputTypesString = outputs
//         .map(out => out.dataType)
//         .join(', ');

//     return `TuplePlaceholder<${outputTypesString}>`
// }

// export function generateStructureIdentifier(typeList: string[]) {
//     if (!typeList.length) {
//         throw new Error(`Cannot make emptry structure`);
//     }
//     let struct = '';
//     for (const name of typeList) {
//         const upperCased = name.charAt(0).toUpperCase() + name.slice(1);
//         struct += upperCased;
//     }
//     return struct;
// }

// export function getStructurePropertyKey(index: number) {
//     if (index >= 26) {
//         throw new Error(`maximum properties reached`);
//     }
//     const charCodeIndex = 'a'.charCodeAt(0) + index;
//     return String.fromCharCode(charCodeIndex);
// }

// export function generateStructureDefinition(typeList: string[]) {
//     const identifier = generateStructureIdentifier(typeList);
//     const propertyList = typeList.map((typeName, index) => {
//         return `    ${typeName} ${getStructurePropertyKey(index)};\n`;
//     });
//     const block = `struct ${identifier} {\n${propertyList.join('')}};`;
//     return block;
// }

export function formatDataTypeText(dataType: DataTypes): string {
    const descriptor = dataTypeDescriptors[dataType];
    if (descriptor.type === 'simple') {
        return descriptor.keyword;
    }
    if (descriptor.type === 'struct') {
        return descriptor.identifier;
    }
    if (descriptor.type === 'lambda') {
        // Solid:(vec3)
        const { returnType, parameterTypes } = descriptor;
        return `${returnType}:(${parameterTypes.join(',')})`
    }
    throw new Error(`Type not found`);
}