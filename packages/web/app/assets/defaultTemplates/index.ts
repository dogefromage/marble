import { GNodeT } from "../../types";
import generativeTemplates from "./generativeTemplates";
import inputTemplates from "./inputTemplates";
import mathTemplates from "./mathTemplates";
import outputTemplates from "./outputTemplates";
import solidOperationTemplates from "./solidOperationTemplates";
import solidTemplates from "./solidTemplates";
import vectorTemplates from "./vectorTemplates";

const defaultTemplates: GNodeT[] =
[
    ...generativeTemplates,
    ...solidTemplates,
    ...solidOperationTemplates,
    ...vectorTemplates,
    ...outputTemplates,
    ...inputTemplates,
    ...mathTemplates,
];

export default defaultTemplates;