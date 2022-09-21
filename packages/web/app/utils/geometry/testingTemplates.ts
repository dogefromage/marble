import { GNodeT, GNodeTypes, RowTypes, DataTypes, KeyValueMap, GNodeActions } from "../../types"

enum TemplateColors
{
    Primitives = '#999966',
}

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
            dataType: DataTypes.Float3,
            name: 'Coordinates',
        },
        {
            id: 'radius',
            type: RowTypes.Field,
            dataType: DataTypes.Float,
            name: 'Radius',
            value: 1,
        }
    ],
    action: 
    {
        actionType: GNodeActions.Call,
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
            type: RowTypes.Input,
            dataType: DataTypes.Float,
            name: 'SDF',
        },
    ],
    action: 
    {
        actionType: GNodeActions.Output,
    }
}

export const NODE_TEMPLATES: KeyValueMap<GNodeT> =
{
    [SPHERE.id]: SPHERE,
    [OUTPUT.id]: OUTPUT,
}