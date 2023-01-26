import { outputNameRow } from "../../content/defaultTemplates/outputTemplates";
import { decomposeTemplateId, defaultDataTypeValue, GeometryS, getTemplateId, GNodeTemplate, GNodeTemplateTypes, InputRowT, NameRowT, ObjMapUndef, SpecificRowT } from "../../types";
import { createReturntypePlaceholder } from "../layerPrograms/generateCodeStatements";

function generateCompositeTemplate(geometry: GeometryS): GNodeTemplate {
    const nameRow: NameRowT = {
        type: 'name',
        id: 'name',
        name: geometry.name,
        color: '#333333',
    };

    const inputs =  geometry.inputs as SpecificRowT[];
    const outputs = geometry.outputs as SpecificRowT[];

    const template: GNodeTemplate = {
        id: getTemplateId(geometry.id, 'composite'),
        version: geometry.version,
        category: 'composite',
        instructions: '',
        rows: [ 
            nameRow,
            ...inputs,
            ...outputs,
        ],
    }

    return template;
}

function generateOutputTemplate(geometry: GeometryS): GNodeTemplate {

    const templateId = getTemplateId(geometry.id, 'output');

    const inputRows: InputRowT[] = geometry.outputs.map(output => {
        return {
            id: output.id,
            type: 'input',
            name: output.name,
            dataType: output.dataType,
            value: defaultDataTypeValue[output.dataType],
        }
    });

    /**
     * calls and returns a constructor function of a 
     * placeholder datatype which will be overwritten during compilation.
     */    
    const returnType = createReturntypePlaceholder(geometry.outputs);
    const constructionArgs = geometry.outputs.map(output => output.id).join(', ');
    const instructions = `return ${returnType}(${constructionArgs})`;

    const outputTemplate: GNodeTemplate = {
        id: templateId,
        version: geometry.version,
        category: 'output',
        rows: [
            outputNameRow,
            ...inputRows as SpecificRowT[],
        ],
        instructions,
    }
    return outputTemplate;
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

    for (const geometry of Object.values(geometries) as GeometryS[]) {
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
