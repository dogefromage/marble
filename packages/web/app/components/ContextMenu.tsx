import ReactDOM from 'react-dom';
import styled from 'styled-components';
import useAvaliableCommands from '../hooks/useAvailableCommands';
import useDispatchCommand from '../hooks/useDispatchCommand';
import { useAppDispatch, useAppSelector } from '../redux/hooks';
import { contextMenuClose, selectContextMenu } from '../slices/contextMenuSlice';
import { CommandCallTypes } from '../types';
import formatKeyCombination from '../utils/formatKeyCombination';
import { CONTEXT_MENU_PORTAL_MOUNT_ID } from './ContextMenuPortalMount';
import Menu from './Menu';
import MenuItem from './MenuItem';

// const ContextMenuDiv = styled.div`
    
//     position: fixed;
//     left: 0;
//     top: 0;
// `;

const ContextMenu = () =>
{
    const dispatch = useAppDispatch();
    const { active } = useAppSelector(selectContextMenu);
    const availableCommands = useAvaliableCommands();
    const dispatchCommand = useDispatchCommand();

    if (!active) return null;

    const selectedCommands = active.commandIds
        .map(commandId => availableCommands[commandId])
        .filter(command => command != null);

    const closeContext = () => dispatch(contextMenuClose());

    return ReactDOM.createPortal(
        <Menu
            position={active.position}
            onUnfocus={closeContext}
        >
            {/* <MenuTitle 
                text={active.name}
            /> */}
            {
                selectedCommands.map(command =>
                {
                    const key = command.keyCombinations?.[0];
                    const formattedKey = key ? formatKeyCombination(key) : undefined;

                    return (
                        <MenuItem 
                            key={command.id}
                            text={command.name}
                            info={formattedKey}
                            onClick={() =>
                            {
                                dispatchCommand(command, active.paramMap, CommandCallTypes.ContextMenu);
                                closeContext();
                            }}
                        />
                    )
                })
            }
        </Menu>,
        document.querySelector(`#${CONTEXT_MENU_PORTAL_MOUNT_ID}`)!
    );
}

export default ContextMenu;