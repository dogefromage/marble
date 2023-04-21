import { DefaultTheme } from "styled-components";
import { SelectionStatus } from "../types";

const defaultTheme: DefaultTheme = {
    colors: {
        general: {
            fields: '#e3e3e3',
        },
        flowEditor: {
            background: '#ada8a6',
            backgroundDots: '#8f8885',
            nodeColor: '#ebedf0',
            edgeColors: {
                normal: 'black',
                redundant: '#363636aa',
                cyclic: '#ba2a09',
            }
        },
        dataTypes: {
            bool: '#787878',
            int: '#617a43',
            float: '#5f91c9',
            vec2: '#3f478c',
            vec3: '#6a40a8',
            vec4: '#5532bf',
            mat3: '#9840ad',
        },
        selectionStatus: {
            [SelectionStatus.Selected]:        '#e7b84a',
            [SelectionStatus.SelectedForeign]: '#4ae7df55',
        }
    },
};

export default defaultTheme;