
export enum Metrics {
    Length = 'length',
    Angle = 'angle',
}

export enum UnitNames {
    // Length
    Meters = 'meters',
    // Angle
    Radians = 'radians',
    Degrees = 'degrees',
}

export interface Unit {
    metric: Metrics;
    name: string;
    abbreviation?: string;
    conversionFactor: number;
}

export type UnitMap = { [ U in UnitNames ]: Unit }

export const allUnits: UnitMap = {
    [ UnitNames.Meters ]: {
        metric: Metrics.Length,
        name: 'Meters',
        abbreviation: 'm',
        conversionFactor: 1,
    },
    [ UnitNames.Radians ]: {
        metric: Metrics.Angle,
        name: 'Radians',
        abbreviation: 'rad',
        conversionFactor: 1,
    },
    [ UnitNames.Degrees ]: {
        metric: Metrics.Angle,
        name: 'Degrees',
        abbreviation: '°',
        conversionFactor: 180.0 / Math.PI,
    }
}

export type UnitSystem = {
    [ M in Metrics ]: UnitNames;
}
