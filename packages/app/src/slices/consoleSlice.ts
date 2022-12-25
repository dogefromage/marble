import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { v4 as uuidv4 } from "uuid";
import { RootState } from "../redux/store";
import { ConsoleSliceState, UndoAction } from "../types";
import { ConsoleMessage, ConsoleMessageType } from "../types/console";

const initialState: ConsoleSliceState = {
    feed: [],
};

export const consoleSlice = createSlice({
    name: 'console',
    initialState,
    reducers: {
        appendMessage: (s, a: PayloadAction<{ text: string, type?: ConsoleMessageType }>) => {
            s.feed.push({
                id: uuidv4(),
                time: Date.now(),
                text: a.payload.text,
                type: a.payload.type,
            });
        },
        clearMessages: (s, a: UndoAction<{}>) => {
            s.feed = [];
        }
    }
});

export const {
    appendMessage: consoleAppendMessage,
    clearMessages: consoleClearMessages,
} = consoleSlice.actions;

export const selectConsole = (state: RootState) => state.console;

const consoleReducer = consoleSlice.reducer;

export default consoleReducer;