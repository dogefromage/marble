import { createSlice } from "@reduxjs/toolkit";
import { DEFAULT_COMMANDS } from "../assets/defaultCommands";
import { RootState } from "../redux/store";
import { CommandsSliceState } from "../types";

const defaultCommandMap = Object.fromEntries(
    DEFAULT_COMMANDS.map(c => ([ c.id, c ]))
);

const initialState: CommandsSliceState = 
{
    commands: defaultCommandMap,
};

export const CommandsSlice = createSlice({
    name: 'commands',
    initialState,
    reducers: {}
});

// export const {
// } = CommandsSlice.actions;

export const selectCommands = (state: RootState) => state.commands;

const commandsReducer = CommandsSlice.reducer;

export default commandsReducer;