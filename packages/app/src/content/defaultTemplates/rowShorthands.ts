import { BaseInputRowT, DataTypes, DataTypeValueTypes, initialDataTypeValue, FieldRowT, OutputRowT, SpecificRowT } from "../../types";

export function nameRow(name: string, color?: string): SpecificRowT {
    return {
        id: 'name',
        type: 'name',
        name,
        color: color ?? '#777',
    };
}

export function inputField<T extends DataTypes>(id: string, name: string, dataType: T, value?: DataTypeValueTypes[T], defaultArgumentToken?: string): FieldRowT<T> {
    return {
        id,
        name,
        type: 'field',
        dataType,
        value: value ?? initialDataTypeValue[dataType],
        defaultArgumentToken,
    };
}

export function inputRow<T extends DataTypes>(id: string, name: string, dataType: T, value?: DataTypeValueTypes[T], defaultArgumentToken?: string): BaseInputRowT<T> {
    return {
        id,
        name,
        type: 'input',
        dataType,
        value: value ?? initialDataTypeValue[dataType],
        defaultArgumentToken,
    };
}

export function outputRow<T extends DataTypes>(id: string, name: string, dataType: T): OutputRowT<T> {
    return {
        id,
        type: 'output',
        name,
        dataType,
    };
}