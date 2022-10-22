import { Command, CommandActionCreator, ViewTypes } from "../../types";

export default function createCommand<V extends ViewTypes>(
    id: string, 
    name: string, 
    viewType: V, 
    actionCreator: CommandActionCreator<V>
): Command<V> 
{
    return { id, name, viewType, actionCreator };
}