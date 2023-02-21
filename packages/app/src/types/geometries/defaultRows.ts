import { GeometrySignature } from "./Geometry";
import { InputRowT, OutputRowT } from "./Rows";

const positionInput: InputRowT<'vec3'> = {
    id: 'position',
    type: 'input',
    name: 'Position',
    dataType: 'vec3',
    value: [0, 0, 0],
    defaultParameter: 'position',
};

export const defaultInputRows = {
    // position: positionInput,
} as const;

const surfaceOutput: OutputRowT<'Surface'> = {
    id: 'surface',
    type: 'output',
    name: 'Surface',
    dataType: 'Surface',
};

export const defaultOutputRows = {
    surface: surfaceOutput
} as const;

export const rootGeometryTemplate: GeometrySignature = {
    name: 'Root Geometry',
    isRoot: true,
    inputs: [ /* defaultInputRows.position */ ],
    outputs: [ defaultOutputRows.surface ],
}
