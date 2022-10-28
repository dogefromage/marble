// import { Command, CommandCreator, CommandScope, ViewTypes } from "../../types";
// import { KeyCombination } from "../../types/command/KeyCombination";

// export default function createViewCommand<V extends ViewTypes>(
//     id: string,
//     name: string,
//     viewType: V,
//     actionCreator: CommandCreator<CommandScope.View, V>,
//     keyCombination?: KeyCombination,
// )
// {
//     const command: Command<CommandScope.View, V> =
//     {
//         id, name, viewType, actionCreator, keyCombination,
//         scope: CommandScope.View,
//     };

//     return command as unknown as Command;
// }