import { DataTypes, RowValueMap, Tuple } from "../../types";
import { formatValueGLSL } from "../../utils/codeGeneration/formatValue";

export enum TemplateColors
{
    Output = '#a3264e',
    Operators = '#123456',
    Primitives = '#999966',
}

export const TEMPLATE_FAR_AWAY = 100000.0;
export const TEMPLATE_FAR_AWAY_FORMAT = formatValueGLSL(TEMPLATE_FAR_AWAY, DataTypes.Float);

export const EMPTY_SOLID = [ TEMPLATE_FAR_AWAY, 0, 0, 0 ] as Tuple<number, 4>;
export const EMPTY_SOLID_FORMAT = formatValueGLSL(EMPTY_SOLID, DataTypes.Solid);

export const MAT3_IDENTITY: RowValueMap[DataTypes.Mat3] = [ 1, 0, 0, 0, 1, 0, 0, 0, 1 ];
