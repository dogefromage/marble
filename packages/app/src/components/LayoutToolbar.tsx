import React from 'react';
import toolbarShape from '../content/menus/toolbar.json';
import { MenuShape } from '../types';
import MenuRoot from './MenuRoot';

interface Props {

}

const LayoutToolbar = ({}: Props) => {
    return (
        <MenuRoot
            menuId='layout'
            menuType={'toolbar'}
            shape={toolbarShape as MenuShape}
            onClose={() => {}}
        />
    );
}

export default LayoutToolbar;