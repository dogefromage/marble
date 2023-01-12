import React, { useMemo } from 'react';
import ReactDOM from 'react-dom';
import styled from 'styled-components';
import { useAppDispatch, useAppSelector } from '../redux/hooks';
import { selectCommands } from '../slices/commandsSlice';
import { contextMenuClose, selectContextMenu } from '../slices/contextMenuSlice';
import { Command, MenuTypes } from '../types';
import generateContextMenuShape from '../utils/generateContextMenuShape';
import { CONTEXT_MENU_PORTAL_MOUNT_ID } from './ContextMenuPortalMount';
import MenuRoot from './MenuRoot';

const FixedDiv = styled.div`
    position: fixed;
    left: 0;
    top: 0;
`;

const ContextMenu = () =>
{
    const dispatch = useAppDispatch();
    const { active } = useAppSelector(selectContextMenu);
    const { commands } = useAppSelector(selectCommands);

    const menuShape = useMemo(() => {
        if (active == null) return;
        const commandList = active.commandIds
            .map(commandId => commands[commandId])
            .filter(command => command != null) as Command[];
        return generateContextMenuShape(commandList);
    }, [ active, commands ]);

    if (!menuShape || !active) return null;

    return ReactDOM.createPortal(
        <FixedDiv>
            <MenuRoot
                type={MenuTypes.Context}
                shape={menuShape}
                onClose={() => {
                    dispatch(contextMenuClose());
                }}
                anchor={active.position}
            />
        </FixedDiv>,
        document.querySelector(`#${CONTEXT_MENU_PORTAL_MOUNT_ID}`)!
    );
}

export default ContextMenu;