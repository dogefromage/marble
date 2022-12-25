import { setTransferData } from "../utils/dnd";
export function useDraggable(props) {
    const onDragStart = (e) => {
        var _a;
        const transfer = (_a = props.start) === null || _a === void 0 ? void 0 : _a.call(props, e);
        setTransferData(e, props.tag, transfer);
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
//# sourceMappingURL=useDraggable.js.map