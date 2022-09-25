// https://styled-components.com/docs/api#typescript
import 'styled-components';
import { DataTypes } from '.';

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
        }
    }
}