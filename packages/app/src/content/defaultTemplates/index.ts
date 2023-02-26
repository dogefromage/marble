import { GNodeTemplate } from "../../types";
import generativeTemplates from "./generativeTemplates";
import mathTemplates from "./mathTemplates";
import solidOperationTemplates from "./solidOperationTemplates";
import solidTemplates from "./solidTemplates";
import vectorTemplates from "./vectorTemplates";

const defaultTemplates: GNodeTemplate[] = [
    ...generativeTemplates,
    ...solidOperationTemplates,
    ...solidTemplates,
    ...vectorTemplates,
    ...mathTemplates,
];

export default defaultTemplates;