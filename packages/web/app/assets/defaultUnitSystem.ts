import { Metrics, UnitNames, UnitSystem } from "../types/world";

const defaultUnitSystem: UnitSystem =
{
    [Metrics.Length]: UnitNames.Meters,
    [Metrics.Angle]: UnitNames.Degrees,
}

export default defaultUnitSystem;