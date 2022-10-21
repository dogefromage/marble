import { useEffect, useRef } from "react";
import { useAppDispatch } from "../redux/hooks";
import { commandsBindCommands, commandsRemoveBinder } from "../slices/commandsSlice";
import { Command } from "../types";

export default function useCommands(commands: Command[], activeWindow: string)
{
    const binderIdentifierRef = useRef({}); // key of WeakMap
    const dispatch = useAppDispatch();
    
    useEffect(() =>
    {
        dispatch(commandsBindCommands({
            commands,
            binderIdentifier: binderIdentifierRef.current,
        }));
    }, [ commands ]);

    useEffect(() =>
    {
        // on unmount
        return () =>
        {
            dispatch(commandsRemoveBinder({
                binderIdentifier: binderIdentifierRef.current,
            }));
        }
    }, []);
}