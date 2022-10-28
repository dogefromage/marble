import { AnyAction } from '@reduxjs/toolkit';
import { PanelStateMap, ViewTypes } from '../view';
import { KeyCombination } from './KeyCombination';

export enum CommandScope
{
    Global = 'global',
    View = 'view',
}

export interface CommandBaseArgs {}

interface GlobalCommandArgs extends CommandBaseArgs {}

interface ViewCommandArgs<V extends ViewTypes = ViewTypes> extends CommandBaseArgs 
{
    panelState: PanelStateMap[V];
}

interface BaseCommand
{
    id: string;
    name: string;
    keyCombination?: KeyCombination;
}

type CommandParameterMap = 
{ 
    [ key: string ]: any; 
};

export type CommandActionCreator<A extends {}> = 
    (scopedArgs: A, parameters: CommandParameterMap) => AnyAction | void;

export interface GlobalCommand extends BaseCommand
{
    scope: CommandScope.Global,
    actionCreator: CommandActionCreator<GlobalCommandArgs>;
}

export interface ViewCommand<V extends ViewTypes> extends BaseCommand
{
    scope: CommandScope.View,
    viewType: V;
    actionCreator: CommandActionCreator<ViewCommandArgs<V>>;
}

export type Command = 
    | GlobalCommand 
    | { [V in ViewTypes]: ViewCommand<V> }[ViewTypes];