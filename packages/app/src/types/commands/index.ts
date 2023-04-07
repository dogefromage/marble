import { AnyAction } from '@reduxjs/toolkit';
import { PanelStateMap, ViewTypes } from '../panelManager/views';
import { Vec2, Rect } from '../UtilityTypes';

export interface KeyCombination {
    key: string;
    displayName?: string;
    ctrlKey?: boolean;
    shiftKey?: boolean;
    altKey?: boolean;
}

export type CommandScope = 'global' | 'view';
export type CommandCallTypes = 'toolbar' | 'contextmenu' | 'keycombination' | 'view';

export interface CommandBaseArgs {
    callType: CommandCallTypes;
}

export interface GlobalCommandArgs extends CommandBaseArgs { }

export interface ViewCommandArgs<V extends ViewTypes = ViewTypes> extends CommandBaseArgs {
    activePanelId: string;
    panelClientRect: Rect;
    panelState: PanelStateMap[ V ];
    offsetCenter: Vec2;
    clientCenter: Vec2;
    offsetCursor?: Vec2;
    clientCursor?: Vec2;
}

interface BaseCommand {
    id: string;
    name: string;
    keyCombinations?: KeyCombination[];
}

interface BaseCommandParameters {
    clientCursor: Vec2;
}
export type CommandParameterMap = 
    Partial<BaseCommandParameters> 
    & { [ key: string ]: any }

type CommandActionCreator<A extends {}> =
    (scopedArgs: A, parameters: CommandParameterMap) => AnyAction[] | AnyAction | void;

interface GlobalCommand extends BaseCommand {
    scope: 'global',
    actionCreator: CommandActionCreator<GlobalCommandArgs>;
}

interface ViewCommand<V extends ViewTypes> extends BaseCommand {
    scope: 'view',
    viewType: V;
    actionCreator: CommandActionCreator<ViewCommandArgs<V>>;
}

export type Command =
    | GlobalCommand
    | { [ V in ViewTypes ]: ViewCommand<V> }[ ViewTypes ];
