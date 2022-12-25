import { useMemo } from "react";
import { useAppSelector } from "../redux/hooks";
import { selectCommands } from "../slices/commandsSlice";

export default function useAvaliableCommands()
{
    const { commands } = useAppSelector(selectCommands);

    // return useMemo(() =>
    // {
    //     const values = Object.values(commands);
    //     return values;
    // }, [ commands ]);

    return commands;
}