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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.useMouseDrag = void 0;
const react_1 = __importStar(require("react"));
const Dragzone_1 = __importDefault(require("../components/Dragzone"));
function useMouseDrag(props) {
    const [dragging, setDragging] = (0, react_1.useState)(false);
    const enableMoveRef = (0, react_1.useRef)(false);
    const start = (e) => {
        var _a;
        if (props.mouseButton && e.button !== props.mouseButton)
            return;
        let out = { cancel: false };
        (_a = props.start) === null || _a === void 0 ? void 0 : _a.call(props, e, () => { out.cancel = true; });
        if (out.cancel)
            return;
        enableMoveRef.current = true;
    };
    const moveFirst = (e) => {
        if (enableMoveRef.current) {
            setDragging(true);
            enableMoveRef.current = false;
        }
    };
    const cancel = (e) => {
        enableMoveRef.current = false;
    };
    const zoneMove = (e) => {
        var _a;
        (_a = props.move) === null || _a === void 0 ? void 0 : _a.call(props, e);
    };
    const zoneEnd = (e) => {
        var _a;
        (_a = props.end) === null || _a === void 0 ? void 0 : _a.call(props, e);
        setDragging(false);
    };
    return {
        handlers: {
            onMouseDown: start,
            onMouseMove: moveFirst,
            onMouseUp: cancel,
        },
        catcher: (dragging ?
            react_1.default.createElement(Dragzone_1.default, { onMouseMove: zoneMove, onMouseUp: zoneEnd, onMouseLeave: zoneEnd, cursor: props.cursor })
            : null)
    };
}
exports.useMouseDrag = useMouseDrag;
//# sourceMappingURL=useMouseDrag.js.map