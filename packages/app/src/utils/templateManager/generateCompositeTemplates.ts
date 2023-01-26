import { outputNameRow } from "../../content/defaultTemplates/outputTemplates";
import { decomposeTemplateId, GeometryS, getTemplateId, GNodeTemplate, GNodeTemplateCategories, GNodeTemplateTypes, NameRowT, ObjMapUndef, OutputRowT, RowT, RowTypes, SpecificRowT } from "../../types";
import { glsl } from "../codeStrings";


function generateCompositeTemplate(geometry: GeometryS): GNodeTemplate {
    const nameRow: NameRowT = {
        type: 'name',
        id: 'name',
        name: geometry.name,
        color: '#333333',
    };

    const outputRow: OutputRowT = {
        type: 'output',
        id: 'output',
        name: 'output',
        dataType: geometry.returnType,
    };

    const inputRows: RowT[] = geometry.arguments.map(arg => ({
        type: 'input_only',
        id: arg.id,
        name: arg.name,
        dataType: arg.dataType,
        value: arg.defaultValue,
    }));

    const template: GNodeTemplate = {
        id: getTemplateId(geometry.id, 'composite'),
        version: geometry.version,
        category: 'composite',
        instructions: '',
        rows: [ nameRow, outputRow, ...(inputRows as SpecificRowT[]) ],
    }

    return template;
}

function generateOutputTemplate(geometry: GeometryS): GNodeTemplate {

    const templateId = getTemplateId(geometry.id, 'output');

    const instructions = ``;

    const outputTemplate: GNodeTemplate = {
        id: templateId,
        category: 'output',
        version: geometry.version,
        rows: [
            outputNameRow,
        ],
        instructions,
    }
}

export default function generateDynamicTemplates(
    geometries: ObjMapUndef<GeometryS>,
    templates: ObjMapUndef<GNodeTemplate>,
) {
    const lastTemplates = new Map<string, GNodeTemplate>();

    for (const template of Object.values(templates) as GNodeTemplate[]) {
        const { templateType } = decomposeTemplateId(template.id);
        const dynamicTemplateTypes: GNodeTemplateTypes[] = [ 'composite', 'output' ];
        if (dynamicTemplateTypes.includes(templateType)) {
            lastTemplates.set(template.id, template);
        }
    }

    const addTemplates: GNodeTemplate[] = [];

    for (const geometry of Object.values(geometries)) {
        if (!geometry || geometry?.isRoot) {
            continue;
        }
        const templateVersion = lastTemplates.get(geometry.id);
        lastTemplates.delete(geometry.id);
        if (templateVersion == null || templateVersion < geometry.version) {
            addTemplates.push(generateCompositeTemplate(geometry));
        }
    }

    // keys that remain must be removed since their geometry does not exist anymore
    const removeTemplateIds: string[] = [ ...lastTemplates.keys() ];

    return {
        addTemplates,
        removeTemplateIds,
    };
}
