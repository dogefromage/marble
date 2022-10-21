import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "../redux/store";
import { Command, CommandsSliceState } from "../types";

const initialState: CommandsSliceState = 
{
    commands: {},
    commandsBinderIdentities: new Map(),
};

export const CommandsSlice = createSlice({
    name: 'commands',
    initialState,
    reducers: {
        bindCommands: (s, a: PayloadAction<{ commands: Command[], binderIdentifier: any }>) =>
        {
            const ids: string[] = [];
            s.commandsBinderIdentities.set(a.payload.binderIdentifier, ids);

            for (const command of a.payload.commands)
            {
                s.commands[command.id] = command;
                ids.push(command.id);
            }
        },
        removeBinder: (s, a: PayloadAction<{ binderIdentifier: any }>) =>
        {
            const commandIds = s.commandsBinderIdentities.get(a.payload.binderIdentifier);
            s.commandsBinderIdentities.delete(a.payload.binderIdentifier);

            if (!commandIds) return;
            for (const id of commandIds)
            {
                delete s.commands[id];
            }
        },
    }
});

export const {
    bindCommands: commandsBindCommands,
    removeBinder: commandsRemoveBinder,
} = CommandsSlice.actions;

export const selectCommands = (state: RootState) => state.commands;

const commandsReducer = CommandsSlice.reducer;

export default commandsReducer;