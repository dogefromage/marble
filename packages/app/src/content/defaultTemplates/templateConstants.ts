import { defaultDataTypeValue, FAR_AWAY } from "../../types";
import { formatLiteral } from "../../utils/layerPrograms/generateCodeStatements";

export enum TemplateColors {
    Output = '#a3264e',
    Operators = '#123456',
    Primitives = '#999966',
}

export const TEMPLATE_FAR_AWAY_LITERAL = formatLiteral(FAR_AWAY, 'float');
export const EMPTY_SOLID_LITERAL = formatLiteral(defaultDataTypeValue['Solid'], 'Solid');
