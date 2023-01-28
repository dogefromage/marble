import { GNodeTemplate } from "../../types";
import generativeTemplates from "./generativeTemplates";
import inputTemplates from "./inputTemplates";
import mathTemplates from "./mathTemplates";
import solidOperationTemplates from "./solidOperationTemplates";
import solidTemplates from "./solidTemplates";
import vectorTemplates from "./vectorTemplates";

const defaultTemplates: GNodeTemplate[] =
[
    ...generativeTemplates,
    ...solidTemplates,
    ...solidOperationTemplates,
    ...vectorTemplates,
    ...inputTemplates,
    ...mathTemplates,
];

export default defaultTemplates;