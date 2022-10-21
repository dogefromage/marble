import { AnyAction } from '@reduxjs/toolkit';
import { GeometryEditorCommandArgs, ViewportCommandArgs } from '..';

export enum CommandContext
{
    Global = 'global',
    GeometryEditor = 'geometryEditor',
    Viewport = 'viewport',
}

export interface SuperCommandArgs {}

export interface GlobalCommandArgs extends SuperCommandArgs {}

export type ContextedCommandArgs =
{
    [CommandContext.GeometryEditor]: GeometryEditorCommandArgs;
    [CommandContext.Viewport]: ViewportCommandArgs;
    [CommandContext.Global]: GlobalCommandArgs;
}

export type CommandActionCreator<S extends CommandContext> = 
    (args: ContextedCommandArgs[S]) => AnyAction

export interface Command<S extends CommandContext = CommandContext>
{
    id: string;
    name: string;
    context: S;
    actionCreator: CommandActionCreator<S>;
}
