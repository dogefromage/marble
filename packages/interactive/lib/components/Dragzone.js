"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Dragzone = void 0;
const react_1 = __importDefault(require("react"));
const react_dom_1 = __importDefault(require("react-dom"));
const styled_components_1 = __importDefault(require("styled-components"));
const DragzoneDiv = styled_components_1.default.div `
    transform: initial;
    position: fixed;
    left: 0;
    top: 0;
    width: 100vw;
    height: 100vh;
    z-index: 6969;

    cursor: ${({ cursor }) => cursor || 'inherit'};
`;
const Dragzone = (props) => {
    return react_dom_1.default.createPortal(react_1.default.createElement(DragzoneDiv, Object.assign({}, props)), document.querySelector(`#dragzone-portal-mount`));
};
exports.Dragzone = Dragzone;
//# sourceMappingURL=Dragzone.js.map