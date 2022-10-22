import { AnyAction } from '@reduxjs/toolkit';
import { PanelStateMap, ViewTypes } from '../view';
import { KeyCombination } from './KeyCombination';

export enum CommandScope
{
    Global = 'global',
    View = 'view',
}

export interface CommandBaseArgs {}

interface GlobalArgs extends CommandBaseArgs {}
interface ViewArgs extends CommandBaseArgs 
{
    panelState: PanelStateMap[ViewTypes];
}

export type CommandArgs<S extends CommandScope> = CommandBaseArgs &
    S extends CommandScope.Global ? GlobalArgs : ViewArgs;

export type CommandCreator<S extends CommandScope = CommandScope> = 
    (args: CommandArgs<S>) => AnyAction;

interface BaseCommand
{
    id: string;
    name: string;
    keyCombination?: KeyCombination;
}

interface GlobalCommand extends BaseCommand
{
    scope: CommandScope.Global,
    actionCreator: CommandCreator<CommandScope.Global>;
}

interface ViewCommand extends BaseCommand
{
    viewType: ViewTypes;
    scope: CommandScope.View,
    actionCreator: CommandCreator<CommandScope.View>;
}

export type Command = GlobalCommand | ViewCommand;