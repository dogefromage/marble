import { ObjMap } from "../UtilityTypes";
import { GeometryTemplate } from "./Geometry";
import { InputRowT, OutputRowT } from "./Rows";

const positionInput: InputRowT<'vec3'> = {
    id: 'position',
    type: 'input',
    name: 'Position',
    dataType: 'vec3',
    value: [0, 0, 0],
    defaultArgumentToken: 'position',
};

export const defaultInputRows = {
    position: positionInput,
} as const;

const solidOutput: OutputRowT<'Solid'> = {
    id: 'solid',
    type: 'output',
    name: 'Solid',
    dataType: 'Solid',
};

export const defaultOutputRows = {
    solid: solidOutput
} as const;

export const rootGeometryTemplate: GeometryTemplate = {
    isRoot: true,
    inputs: [defaultInputRows.position ],
    outputs: [ defaultOutputRows.solid ],
}
