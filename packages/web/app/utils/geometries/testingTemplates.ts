import { GNodeT, GNodeTypes, RowTypes, DataTypes, ObjMap, ProgramOperationTypes, ArithmeticOperations, DefaultFunctionArgs, DefaultFunctionArgNames, RowValueTriple, RowValuePair } from "../../types"

enum TemplateColors
{
    Primitives = '#999966',
}

const VEC2_ZERO: RowValuePair = [ 0, 0 ];
const VEC3_ZERO: RowValueTriple = [ 0, 0, 0 ];

const FAR_AWAY = 100000;

const SPHERE: GNodeT = 
{
    id: 'sphere',
    type: GNodeTypes.Default,
    rows: [
        {
            id: 'name',
            type: RowTypes.Name,
            name: 'Sphere',
            color: TemplateColors.Primitives,
        },
        {
            id: 'output',
            type: RowTypes.Output,
            dataType: DataTypes.Float,
            name: 'SDF',
        },
        {
            id: 'coordinates',
            type: RowTypes.InputOnly,
            name: 'Coordinates',
            dataType: DataTypes.Vec3,
            value: VEC3_ZERO,
            alternativeArg: DefaultFunctionArgNames.RayPosition,
        },
        {
            id: 'radius',
            type: RowTypes.Field,
            dataType: DataTypes.Float,
            name: 'Radius',
            value: 1,
        }
    ],
    operation: 
    {
        type: ProgramOperationTypes.Call,
        functionName: 'inc_sdf_sphere',
        argumentRowIds: [ 'coordinates', 'radius' ],
        outputRowId: 'output',
        outputDatatype: DataTypes.Float,
    }
}

const CUBE: GNodeT = 
{
    id: 'cube',
    type: GNodeTypes.Default,
    rows: [
        {
            id: 'name',
            type: RowTypes.Name,
            name: 'Cube',
            color: TemplateColors.Primitives,
        },
        {
            id: 'output',
            type: RowTypes.Output,
            dataType: DataTypes.Float,
            name: 'SDF',
        },
        {
            id: 'coordinates',
            type: RowTypes.InputOnly,
            name: 'Coordinates',
            dataType: DataTypes.Vec3,
            value: VEC3_ZERO,
            alternativeArg: DefaultFunctionArgNames.RayPosition,
        },
        {
            id: 'size',
            type: RowTypes.Field,
            dataType: DataTypes.Float,
            name: 'Size',
            value: 1,
        }
    ],
    operation: 
    {
        type: ProgramOperationTypes.Call,
        functionName: 'inc_sdf_cube',
        argumentRowIds: [ 'coordinates', 'size' ],
        outputRowId: 'output',
        outputDatatype: DataTypes.Float,
    }
}

const OUTPUT: GNodeT =
{
    id: 'output',
    type: GNodeTypes.Default,
    rows: [
        {
            id: 'name',
            type: RowTypes.Name,
            name: 'Geometry Output',
            color: '#a3264e',
        },
        {
            id: 'input',
            name: 'SDF',
            type: RowTypes.InputOnly,
            dataType: DataTypes.Float,
            value: FAR_AWAY,
        },
    ],
    operation: 
    {
        type: ProgramOperationTypes.Output,
        inputRowId: 'input'
    }
}

const ADD: GNodeT =
{
    id: 'add',
    type: GNodeTypes.Default,
    rows: [
        {
            id: 'name',
            type: RowTypes.Name,
            name: 'Add',
            color: '#123456',
        },
        {
            id: 'c',
            type: RowTypes.Output,
            dataType: DataTypes.Float,
            name: 'C',
        },
        {
            id: 'a',
            type: RowTypes.Field,
            name: 'A',
            dataType: DataTypes.Float,
            value: 0,
        },
        {
            id: 'b',
            type: RowTypes.Field,
            name: 'B',
            dataType: DataTypes.Float,
            value: 0,
        },
    ],
    operation: 
    {
        type: ProgramOperationTypes.Arithmetic,
        lhsRowId: 'a',
        rhsRowId: 'b',
        outputRowId: 'c',
        operation: ArithmeticOperations.Add,
        outputDatatype: DataTypes.Float,
    }
}

const UNION: GNodeT =
{
    id: 'union',
    type: GNodeTypes.Default,
    rows: [
        {
            id: 'name',
            type: RowTypes.Name,
            name: 'Union',
            color: '#123456',
        },
        {
            id: 'c',
            type: RowTypes.Output,
            dataType: DataTypes.Float,
            name: 'C',
        },
        {
            id: 'a',
            type: RowTypes.InputOnly,
            name: 'A',
            dataType: DataTypes.Float,
            value: FAR_AWAY,
        },
        {
            id: 'b',
            type: RowTypes.InputOnly,
            name: 'B',
            dataType: DataTypes.Float,
            value: FAR_AWAY,
        },
    ],
    operation: 
    {
        type: ProgramOperationTypes.Call,
        functionName: 'inc_union',
        argumentRowIds: [ 'a', 'b' ],
        outputRowId: 'c',
        outputDatatype: DataTypes.Float,
    }
}

const DIFFERENCE: GNodeT =
{
    id: 'difference',
    type: GNodeTypes.Default,
    rows: [
        {
            id: 'name',
            type: RowTypes.Name,
            name: 'Difference',
            color: '#123456',
        },
        {
            id: 'c',
            type: RowTypes.Output,
            dataType: DataTypes.Float,
            name: 'C',
        },
        {
            id: 'a',
            type: RowTypes.InputOnly,
            name: 'A',
            dataType: DataTypes.Float,
            value: FAR_AWAY,
        },
        {
            id: 'b',
            type: RowTypes.InputOnly,
            name: 'B',
            dataType: DataTypes.Float,
            value: 0,
        },
    ],
    operation: 
    {
        type: ProgramOperationTypes.Call,
        functionName: 'inc_difference',
        argumentRowIds: [ 'a', 'b' ],
        outputRowId: 'c',
        outputDatatype: DataTypes.Float,
    }
}

const TRANSFORM: GNodeT =
{
    id: 'transform',
    type: GNodeTypes.Default,
    rows: [
        {
            id: 'name',
            type: RowTypes.Name,
            name: 'Transform',
            color: '#123456',
        },
        {
            id: 'y',
            type: RowTypes.Output,
            dataType: DataTypes.Vec3,
            name: 'Y',
        },
        {
            id: 'x',
            type: RowTypes.InputOnly,
            dataType: DataTypes.Vec3,
            name: 'X',
            value: VEC3_ZERO,
            alternativeArg: DefaultFunctionArgNames.RayPosition,
        },
        {
            id: 'translation',
            type: RowTypes.Field,
            dataType: DataTypes.Vec3,
            name: 'Translation',
            value: VEC3_ZERO,
        },
    ],
    operation: 
    {
        type: ProgramOperationTypes.Call,
        functionName: 'inc_transform',
        argumentRowIds: [ 'x' ],
        outputRowId: 'y',
        outputDatatype: DataTypes.Vec3,
    }
}

const TESTING: GNodeT =
{
    id: 'testing',
    type: GNodeTypes.Default,
    rows: [
        {
            id: 'name',
            type: RowTypes.Name,
            name: 'Testing',
            color: '#123456',
        },
        {
            id: 'y',
            type: RowTypes.Output,
            dataType: DataTypes.Vec3,
            name: 'Y',
        },
        {
            id: 'asd',
            type: RowTypes.Output,
            dataType: DataTypes.Float,
            name: 'asdsd',
        },
        {
            id: 'asdasd',
            type: RowTypes.Output,
            dataType: DataTypes.Vec2,
            name: 'aa',
        },
        {
            id: 'x',
            type: RowTypes.InputOnly,
            dataType: DataTypes.Vec3,
            name: 'X',
            value: VEC3_ZERO,
            alternativeArg: DefaultFunctionArgNames.RayPosition,
        },
        {
            id: 'test',
            type: RowTypes.Field,
            dataType: DataTypes.Vec2,
            name: 'TKJSLKd',
            value: VEC2_ZERO,
        },
        {
            id: 'sdsa',
            type: RowTypes.Field,
            dataType: DataTypes.Vec3,
            name: 'a1231',
            value: VEC3_ZERO,
        },
        {
            id: 'asdfa',
            type: RowTypes.Field,
            dataType: DataTypes.Float,
            name: '434',
            value: 0,
        },
    ],
    operation: 
    {
        type: ProgramOperationTypes.Call,
        functionName: 'inc_transform',
        argumentRowIds: [ 'x' ],
        outputRowId: 'y',
        outputDatatype: DataTypes.Vec3,
    }
}

export const NODE_TEMPLATES: ObjMap<GNodeT> =
{
    [TRANSFORM.id]: TRANSFORM,
    [CUBE.id]: CUBE,
    [SPHERE.id]: SPHERE,
    [UNION.id]: UNION,
    [DIFFERENCE.id]: DIFFERENCE,
    [OUTPUT.id]: OUTPUT,
    [ADD.id]: ADD,
    // [TESTING.id]: TESTING,
}