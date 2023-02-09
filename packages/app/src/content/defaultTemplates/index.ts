import { GNodeTemplate } from "../../types";
import generativeTemplates from "./generativeTemplates";
import mathTemplates from "./mathTemplates";
import newCompilationTemplates from "./newCompilationTemplates";
import solidOperationTemplates from "./solidOperationTemplates";
import solidTemplates from "./solidTemplates";
import vectorTemplates from "./vectorTemplates";

// const defaultTemplates: GNodeTemplate[] = [
//     ...generativeTemplates,
//     ...solidTemplates,
//     ...solidOperationTemplates,
//     ...vectorTemplates,
//     ...mathTemplates,
// ];

const defaultTemplates = newCompilationTemplates;

export default defaultTemplates;