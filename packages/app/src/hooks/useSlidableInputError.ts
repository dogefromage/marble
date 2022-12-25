import { useCallback } from "react";
import { useAppDispatch } from "../redux/hooks";
import { consoleAppendMessage } from "../slices/consoleSlice";


export default function() {
    const dispatch = useAppDispatch();
    return useCallback((e: Error) => 
        dispatch(consoleAppendMessage({
            text: `Error at evaluating user input: ${e}`,
            type: 'error',
        })),
        [ dispatch ]
    );
}