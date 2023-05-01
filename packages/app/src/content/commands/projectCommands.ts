import { appLoadProject, appSetOpenFilePopup } from "../../slices/appSlice";
import { Command } from "../../types";
import { download } from "../../utils/download";
import { getLocalProjectJson } from "../../utils/projectStorage";

export const projectCommands: Command[] = [
    /**
     * GLOBAL
     */
    {
        id: 'project.save',
        name: 'Save Project',
        scope: 'global',
        actionCreator() {
            const localProject = getLocalProjectJson();
            if (localProject) {
                download(localProject, 'application/json', 'project.marble');
            } else {
                console.error(`No Project found.`);
            }
        },
        keyCombinations: [{ key: 's', ctrlKey: true }],
    },
    {
        id: 'project.load',
        name: 'Load Project',
        scope: 'global',
        actionCreator() {
            return appSetOpenFilePopup();
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