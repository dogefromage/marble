import { AnyAction } from '@reduxjs/toolkit';
import { ActivePanel } from '../panelManager';
import { PanelStateMap, ViewTypes } from '../panelManager/views';

export interface KeyCombination {
    key: string;
    displayName?: string;
    ctrlKey?: boolean;
    shiftKey?: boolean;
    altKey?: boolean;
}

export enum CommandScope {
    Global = 'global',
    View = 'view',
}

export enum CommandCallTypes {
    Toolbar = 'toolbar',
    ContextMenu = 'contextmenu',
    KeyCombination = 'keycombination',
}

export interface CommandBaseArgs {
    callType: CommandCallTypes;
}

export interface GlobalCommandArgs extends CommandBaseArgs { }

export interface ViewCommandArgs<V extends ViewTypes = ViewTypes> extends CommandBaseArgs {
    activePanel: ActivePanel;
    panelState: PanelStateMap[ V ];
}

interface BaseCommand {
    id: string;
    name: string;
    keyCombinations?: KeyCombination[];
}

export type CommandParameterMap =
    {
        [ key: string ]: any;
    };

type CommandActionCreator<A extends {}> =
    (scopedArgs: A, parameters: CommandParameterMap) => AnyAction[] | AnyAction | void;

interface GlobalCommand extends BaseCommand {
    scope: CommandScope.Global,
    actionCreator: CommandActionCreator<GlobalCommandArgs>;
}

interface ViewCommand<V extends ViewTypes> extends BaseCommand {
    scope: CommandScope.View,
    viewType: V;
    actionCreator: CommandActionCreator<ViewCommandArgs<V>>;
}

export type Command =
    | GlobalCommand
    | { [ V in ViewTypes ]: ViewCommand<V> }[ ViewTypes ];
