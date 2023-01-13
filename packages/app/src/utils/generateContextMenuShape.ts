import { Command, VerticalMenuShape } from "../types";

export default function generateContextMenuShape(commandList: Command[]) {
    const root: VerticalMenuShape = {
        type: 'vertical',
        list: commandList.map(command => ({
            type: 'command',
            key: command.id,
            name: command.name,
            command: command.id,
        })),
    };
    return root;
}