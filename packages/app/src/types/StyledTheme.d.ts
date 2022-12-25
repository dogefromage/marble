// https://styled-components.com/docs/api#typescript
import 'styled-components';
import { DataTypes, SelectionStatus } from '.';

declare module 'styled-components' 
{
    export interface DefaultTheme
    {
        colors: 
        {
            dataTypes:
            {
                [D in DataTypes]: string;
            }
            selectionStatus: {
                [S in SelectionStatus]?: string;
            }
        }
    }
}