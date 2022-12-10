import { DefaultTheme } from "styled-components";
import { SelectionStatus } from "../types";

const defaultTheme: DefaultTheme = 
{
    colors: 
    {
        dataTypes: {
            unknown: '#636363',
            float: '#5f91c9',
            vec2: '#5f64c9',
            vec3: '#5d48b0',
            mat3: '#b03bd4',
            Solid: '#d4a63b',
        },
        selectionStatus: {
            [SelectionStatus.Selected]: '#e7b84a',
            [SelectionStatus.Active]: '#e74a54',
        }
    },
};

export default defaultTheme;