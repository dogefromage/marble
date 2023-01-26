import React from 'react';
import toolbarShape from '../content/menus/toolbar.json';
import { MenuShape, MenuTypes } from '../types';
import MenuRoot from './MenuRoot';

interface Props
{

}

const LayoutToolbar = ({ }: Props) =>
{
    return (
        <MenuRoot 
            type={'toolbar'}
            shape={toolbarShape as MenuShape}
        />
    );
}

export default LayoutToolbar;