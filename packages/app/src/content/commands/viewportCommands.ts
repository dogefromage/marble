import { defaultViewportCamera, viewportPanelEditCamera } from "../../slices/panelViewportSlice";
import { Command, ViewTypes } from "../../types";

// actionCreator({ activePanelId, clientCursor, offsetCursor, offsetCenter, clientCenter }, params) {

export const viewportCommands: Command[] = [
    {
        scope: 'view',
        viewType: ViewTypes.Viewport,
        id: 'viewport.resetView',
        name: 'Reset View',
        actionCreator({ activePanelId }, params) {
            return viewportPanelEditCamera({
                panelId: activePanelId,
                partialCamera: defaultViewportCamera,
            });
        },
    },
];