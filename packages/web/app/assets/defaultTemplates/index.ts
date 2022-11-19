import { GNodeT } from "../../types";
import inputTemplates from "./inputTemplates";
import outputTemplates from "./outputTemplates";
import solidOperationTemplates from "./solidOperationTemplates";
import solidTemplates from "./solidTemplates";
import vectorTemplates from "./vectorTemplates";

const defaultTemplates: GNodeT[] =
[
    ...solidTemplates,
    ...solidOperationTemplates,
    ...vectorTemplates,
    ...outputTemplates,
    ...inputTemplates,
];

export default defaultTemplates;