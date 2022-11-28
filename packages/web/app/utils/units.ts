import { Metrics, UnitNames, UNITS } from "../types/world";
import { clamp } from "./math";

const MAX_VALUE = 1e32;

function formatSimple(value: number)
{
    if (typeof value !== 'number' || 
        !isFinite(value)) return 'NaN';

    let precision = value.toPrecision(4);
    let string = value.toString();
    return precision.length > string.length ? string : precision;
}

function formatNumber(value: number, unitName?: UnitNames)
{
    if (!unitName) return formatSimple(value);

    const unit = UNITS[unitName];
    const formattedScaled = formatSimple(unit.conversionFactor * value);

    if (unit.abbreviation == null) 
        return formattedScaled; 
    
    return formattedScaled + unit.abbreviation;
}

function parseSimple(input: string)
{
    const evaluatedString = eval(input);
    let numberValue = clamp(Number.parseFloat(evaluatedString), -MAX_VALUE, MAX_VALUE);
    if (!isFinite(numberValue)) throw new Error(`Input value is not finite`);
    return numberValue;
}

function parseInput(input: string, metric?: Metrics, unitName?: UnitNames)
{
    if (!metric || !unitName) return parseSimple(input);

    let trimmed = input.trim();
    
    const abbrev = trimmed.match(/([A-z°]+)$/)?.[0];
    if (abbrev)
    {
        for (const un in UNITS)
        {
            const unit = UNITS[un];
            if (unit.metric === metric && 
                unit.abbreviation && 
                unit.abbreviation === abbrev)
            {
                unitName = un as UnitNames;
                trimmed = trimmed.replace(abbrev, '');
                break;
            }
        };
    }

    const unit = UNITS[unitName];

    return parseSimple(trimmed) / unit.conversionFactor;
}

export const Units = 
{
    formatNumber,
    parseInput,
}