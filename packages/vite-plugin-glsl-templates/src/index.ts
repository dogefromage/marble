import { PluginOption } from 'vite';
import { TemplateSheetParser } from './TemplateSheetParser';

export * from './typings';

const glslTemplateRegex = /\.template\.glsl$/;

export function glslTemplatePlugin(): PluginOption {
    return {
        name: 'vite-plugin-glsl-templates',
        enforce: 'pre',
        transform(code, id) {
            if (glslTemplateRegex.test(id)) {
                return {
                    code: templatesToModule(code),
                }
            }
        }
    }
}

const moduleTemplate = `
const templates = JSON.parse('%TEMPLATE_JSON%');
export default templates;
`;

function templatesToModule(src: string) {
    const parser = new TemplateSheetParser(src);
    const templateList = JSON.stringify(parser.templates, (key, value) => {
        if (typeof value === 'string') {
            return escapeSpecials(value);
        }
        return value;
    });
    const moduleCode = moduleTemplate.replace('%TEMPLATE_JSON%', templateList);
    return moduleCode;
}

export function escapeSpecials(str: string) {
    return str.replace(/\n/g, "\\n").replace(/\r/g, "\\r").replace(/\t/g, "\\t");
}