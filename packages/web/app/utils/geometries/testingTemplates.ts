import { GNodeT, GNodeTypes, RowTypes, DataTypes, ObjMap, ProgramOperationTypes, ArithmeticOperations, DefaultFunctionArgs, DefaultFunctionArgNames } from "../../types"

enum TemplateColors
{
    Primitives = '#999966',
}

const VEC3_ZERO = [ 0, 0, 0 ];

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
            type: RowTypes.Input,
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
            type: RowTypes.Input,
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
            type: RowTypes.Input,
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
            type: RowTypes.Input,
            name: 'A',
            dataType: DataTypes.Float,
            value: FAR_AWAY,
        },
        {
            id: 'b',
            type: RowTypes.Input,
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
            type: RowTypes.Input,
            name: 'A',
            dataType: DataTypes.Float,
            value: FAR_AWAY,
        },
        {
            id: 'b',
            type: RowTypes.Input,
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

export const NODE_TEMPLATES: ObjMap<GNodeT> =
{
    [CUBE.id]: CUBE,
    [SPHERE.id]: SPHERE,
    [UNION.id]: UNION,
    [DIFFERENCE.id]: DIFFERENCE,
    [OUTPUT.id]: OUTPUT,
    // [ADD.id]: ADD,
}