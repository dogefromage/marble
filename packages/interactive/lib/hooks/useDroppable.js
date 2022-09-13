"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useDroppable = void 0;
const react_1 = require("react");
const dnd_1 = require("../utils/dnd");
function useDroppable(props) {
    const [isHovering, setIsHovering] = (0, react_1.useState)(false);
    const depthCounterRef = (0, react_1.useRef)(0);
    const onDragEnter = (e) => {
        var _a;
        const transfer = (0, dnd_1.getTransferData)(e, props.tag);
        if (!transfer)
            return;
        depthCounterRef.current++;
        (_a = props.enter) === null || _a === void 0 ? void 0 : _a.call(props, e, transfer);
    };
    const onDragOver = (e) => {
        var _a;
        const transfer = (0, dnd_1.getTransferData)(e, props.tag);
        if (!transfer)
            return;
        (_a = props.over) === null || _a === void 0 ? void 0 : _a.call(props, e, transfer);
        if (e.isDefaultPrevented()) {
            setIsHovering(true);
        }
    };
    const onDragLeave = (e) => {
        var _a;
        const transfer = (0, dnd_1.getTransferData)(e, props.tag);
        if (!transfer)
            return;
        depthCounterRef.current--;
        if (depthCounterRef.current <= 0) {
            depthCounterRef.current = 0;
            setIsHovering(false);
        }
        (_a = props.leave) === null || _a === void 0 ? void 0 : _a.call(props, e, transfer);
    };
    const onDrop = (e) => {
        var _a;
        const transfer = (0, dnd_1.getTransferData)(e, props.tag);
        if (!transfer)
            return;
        setIsHovering(false);
        depthCounterRef.current = 0;
        (_a = props.drop) === null || _a === void 0 ? void 0 : _a.call(props, e, transfer);
    };
    return {
        handlers: {
            onDragEnter,
            onDragOver,
            onDragLeave,
            onDrop,
        },
        isHovering,
    };
}
exports.useDroppable = useDroppable;
//# sourceMappingURL=useDroppable.js.map