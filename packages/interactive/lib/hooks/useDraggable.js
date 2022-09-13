"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useDraggable = void 0;
const dnd_1 = require("../utils/dnd");
function useDraggable(props) {
    const onDragStart = (e) => {
        var _a;
        const transfer = (_a = props.start) === null || _a === void 0 ? void 0 : _a.call(props, e);
        (0, dnd_1.setTransferData)(e, props.tag, transfer);
    };
    const onDragEnd = (e) => {
        var _a;
        (_a = props.end) === null || _a === void 0 ? void 0 : _a.call(props, e);
    };
    return {
        handlers: {
            onDragStart,
            onDragEnd,
            draggable: true,
        }
    };
}
exports.useDraggable = useDraggable;
//# sourceMappingURL=useDraggable.js.map