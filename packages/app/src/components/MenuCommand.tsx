import React from 'react';
import useDispatchCommand from '../hooks/useDispatchCommand';
import { menuStoreClose } from '../hooks/useMenuStore';
import { useAppSelector } from '../redux/hooks';
import { selectCommands } from '../slices/commandsSlice';
import { selectContextMenu } from '../slices/contextMenuSlice';
import { MenuCommandDiv } from '../styles/MenuElementDiv';
import { CommandCallTypes, CommandMenuElement, MenuStore, MenuTypes } from '../types';
import formatKeyCombination from '../utils/formatKeyCombination';

interface Props
{
    depth: number;
    menuStore: MenuStore;
    element: CommandMenuElement;
}

const MenuCommand = ({ element, menuStore }: Props) =>
{
    const { active } = useAppSelector(selectContextMenu);
    const { commands } = useAppSelector(selectCommands);
    const dispatchCommand = useDispatchCommand();

    let text = element.command;
    let info = '';    

    const command = commands[element.command];
    if (command != null) {
        text = command.name;
        const keyComb = command.keyCombinations?.[0];
        if (keyComb) {
            info = formatKeyCombination(keyComb);
        }
    } 

    const invoke = () => {
        if (!command) return;
        menuStore.dispatch(menuStoreClose());

        if (menuStore.state.type === MenuTypes.Context) {
        if (!active) return;
            dispatchCommand(command, active.paramMap, CommandCallTypes.ContextMenu);
        }
        else if (menuStore.state.type === MenuTypes.Toolbar) {
            dispatchCommand(command, {}, CommandCallTypes.Toolbar);
        }
        else {
            console.error(`Command not dispatched, menutype not found`);
        }
    }

    return (
        <MenuCommandDiv
            onClick={invoke}
        >
        {
            <p>{ text }</p>
        }{
            info && <p>{ info }</p>
        }
        </MenuCommandDiv>
    );
}

export default MenuCommand;