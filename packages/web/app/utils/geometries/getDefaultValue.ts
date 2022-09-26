import { DataTypes, RowValue } from "../../types";

const DEFAULT_VALUES: {
    [K in DataTypes]: RowValue;
} =
{
    [DataTypes.Unknown]: 0,
    [DataTypes.Float]: 0,
    [DataTypes.Float3]: [ 0, 0, 0 ],
}

export function getDefaultValue(dataType: DataTypes)
{
    return DEFAULT_VALUES[dataType];
}