// https://styled-components.com/docs/api#typescript
import 'styled-components';
import { StaticDataTypes, SelectionStatus } from '.';

declare module 'styled-components' {
    export interface DefaultTheme {
        colors: {
            geometryEditor: {
                background: string;
                backgroundDots: string;
            }
            dataTypes: {
                [ D in StaticDataTypes ]: string;
            }
            selectionStatus: {
                [ S in SelectionStatus ]?: string;
            }
        }
    }
}