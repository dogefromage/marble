import React, { useRef, useState } from "react";
import { Dragzone } from "../components/Dragzone";
export function useMouseDrag(interactions, options) {
    const interactionArr = Array.isArray(interactions) ? interactions : [interactions];
    const [dragging, setDragging] = useState(false);
    const moveRef = useRef({
        activeInteractions: [],
        mouseDown: false,
        startPos: {
            x: 0,
            y: 0,
        }
    });
    const start = (e) => {
        var _a;
        const activeInteractions = [];
        for (let i = 0; i < interactionArr.length; i++) {
            const interaction = interactionArr[i];
            if (interaction.mouseButton != null && e.button !== interaction.mouseButton)
                continue;
            let out = { cancelFlag: false };
            (_a = interaction.start) === null || _a === void 0 ? void 0 : _a.call(interaction, e, () => { out.cancelFlag = true; });
            if (out.cancelFlag)
                continue;
            activeInteractions.push(i);
        }
        moveRef.current = {
            activeInteractions,
            mouseDown: activeInteractions.length > 0,
            startPos: { x: e.clientX, y: e.clientY },
        };
    };
    const moveFirst = (e) => {
        if (moveRef.current.mouseDown) {
            const deltaMove = Math.hypot(moveRef.current.startPos.x - e.clientX, moveRef.current.startPos.y - e.clientY);
            if ((options === null || options === void 0 ? void 0 : options.deadzone) && deltaMove < options.deadzone) {
                return;
            }
            setDragging(true);
            moveRef.current.mouseDown = false;
        }
    };
    const cancel = (e) => {
        moveRef.current.mouseDown = false;
    };
    const zoneMove = (e) => {
        var _a;
        if (moveRef.current.mouseDown)
            return;
        for (const index of moveRef.current.activeInteractions) {
            const interaction = interactionArr[index];
            (_a = interaction.move) === null || _a === void 0 ? void 0 : _a.call(interaction, e);
        }
    };
    const zoneEnd = (e) => {
        var _a;
        if (moveRef.current.mouseDown)
            return;
        for (const index of moveRef.current.activeInteractions) {
            const interaction = interactionArr[index];
            (_a = interaction.end) === null || _a === void 0 ? void 0 : _a.call(interaction, e);
        }
        setDragging(false);
    };
    return {
        handlers: {
            onMouseDown: start,
            onMouseMove: moveFirst,
            onMouseUp: cancel,
        },
        catcher: (dragging ?
            React.createElement(Dragzone, { onMouseMove: zoneMove, onMouseUp: zoneEnd, onMouseLeave: zoneEnd, cursor: options === null || options === void 0 ? void 0 : options.cursor })
            : null)
    };
}
//# sourceMappingURL=useMouseDrag.js.map