import { CommandActionCreator, CommandContext } from "../../types";

export default function createCommand<S extends CommandContext>(
    id: string, 
    name: string, 
    scope: S, 
    actionCreator: CommandActionCreator<S>
) {
    return { id, name, scope, actionCreator };
}