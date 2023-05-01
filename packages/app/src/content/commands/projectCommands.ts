import { appLoadProject } from "../../slices/appSlice";
import { Command } from "../../types";

export const projectCommands: Command[] = [
    /**
     * GLOBAL
     */
    {
        id: 'project.save',
        name: 'Save Project',
        scope: 'global',
        actionCreator() {
            console.log('save');
        },
        keyCombinations: [{ key: 's', ctrlKey: true }],
    },
    {
        id: 'project.load',
        name: 'Load Project',
        scope: 'global',
        actionCreator() {
            console.log('load');
        },
        keyCombinations: [{ key: 'o', ctrlKey: true }],
    },
    {
        id: 'project.blank',
        name: 'Blank Project',
        scope: 'global',
        actionCreator() {
            return appLoadProject({
                data: null,
            });
        },
        keyCombinations: [{ key: 'b', ctrlKey: true }],
    },
];