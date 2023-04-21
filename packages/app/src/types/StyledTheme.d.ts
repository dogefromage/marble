// https://styled-components.com/docs/api#typescript
import 'styled-components';
import { DataTypes, SelectionStatus } from '.';
import { EdgeColor } from '@marble/language';

declare module 'styled-components' {
    export interface DefaultTheme {
        colors: {
            general: {
                fields: string;
            }
            flowEditor: {
                background: string;
                backgroundDots: string;
                nodeColor: string;
                edgeColors: Record<EdgeColor, string>;
            }
            dataTypes: {
                [ D in DataTypes ]: string;
            }
            selectionStatus: {
                [ S in SelectionStatus ]?: string;
            }
        }
    }
}