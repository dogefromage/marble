"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.useMouseDrag = void 0;
const react_1 = __importStar(require("react"));
const Dragzone_1 = require("../components/Dragzone");
function useMouseDrag(interactions, options) {
    const interactionArr = Array.isArray(interactions) ? interactions : [interactions];
    const [dragging, setDragging] = (0, react_1.useState)(false);
    const moveRef = (0, react_1.useRef)({
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
            react_1.default.createElement(Dragzone_1.Dragzone, { onMouseMove: zoneMove, onMouseUp: zoneEnd, onMouseLeave: zoneEnd, cursor: options === null || options === void 0 ? void 0 : options.cursor })
            : null)
    };
}
exports.useMouseDrag = useMouseDrag;
//# sourceMappingURL=useMouseDrag.js.map