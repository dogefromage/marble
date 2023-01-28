import { decomposeTemplateId, defaultDataTypeValue, GeometryS, getTemplateId, GNodeTemplate, GNodeTemplateTypes, BaseInputRowT, NameRowT, ObjMapUndef, SpecificRowT } from "../../types";
import { prefixGeometryFunction } from "../layerPrograms";
import { createReturntypePlaceholder } from "../layerPrograms/generateCodeStatements";

function generateCompositeInstructions(geometry: GeometryS) {
    const { inputs, outputs } = geometry;
    if (outputs.length === 0) {
        return '';
    }
    if (outputs.length > 1) {
        throw new Error(`implement multiple outputs`);
    }
    const instructionInputArgs = inputs.map(input => input.id).join(', ');
    const functionName = prefixGeometryFunction(geometry.id);
    const functionInvoc = `${functionName}(${instructionInputArgs})`;

    const output = outputs[0];
    return `${output.dataType} ${output.id} = ${functionInvoc};`;
}

function generateCompositeTemplate(geometry: GeometryS): GNodeTemplate {
    const nameRow: NameRowT = {
        type: 'name',
        id: 'name',
        name: geometry.name,
        color: '#333333',
    };
    const instructions = generateCompositeInstructions(geometry);

    const template: GNodeTemplate = {
        id: getTemplateId(geometry.id, 'composite'),
        version: geometry.version,
        category: 'composite',
        instructions,
        rows: [ 
            nameRow,
            ...geometry.inputs as SpecificRowT[],
            ...geometry.outputs as SpecificRowT[],
        ],
    }
    return template;
}

function generateOutputTemplate(geometry: GeometryS): GNodeTemplate {

    const templateId = getTemplateId(geometry.id, 'output');

    const inputRows: BaseInputRowT[] = geometry.outputs.map(output => {
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
    const outputIdentifierList = geometry.outputs.map(output => output.id).join(', ');
    const returnType = createReturntypePlaceholder(geometry.outputs);

    let instructions = '';
    if (geometry.outputs.length === 1) {
        instructions = `return ${outputIdentifierList};`;
    } else if (geometry.outputs.length > 1) {
        instructions = `return ${returnType}(${outputIdentifierList});`;
    }

    const outputTemplate: GNodeTemplate = {
        id: templateId,
        version: geometry.version,
        category: 'output',
        rows: [
            {
                id: 'name',
                type: 'name',
                name: 'Output',
                color: '#a3264e',
            },
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
        const { type: templateType } = decomposeTemplateId(template.id);
        const dynamicTemplateTypes: GNodeTemplateTypes[] = [ 'composite', 'output' ];
        if (dynamicTemplateTypes.includes(templateType)) {
            lastTemplates.set(template.id, template);
        }
    }

    const addTemplates: GNodeTemplate[] = [];

    for (const geometry of Object.values(geometries) as GeometryS[]) {

        const outputTemplateId = getTemplateId(geometry.id, 'output');
        const compositeTemplateId = getTemplateId(geometry.id, 'composite');
        const lastOutputTemplate = lastTemplates.get(outputTemplateId);
        const lastCompositeTemplate = lastTemplates.get(compositeTemplateId);
        lastTemplates.delete(outputTemplateId);
        lastTemplates.delete(compositeTemplateId);
        if (lastOutputTemplate == null || lastOutputTemplate.version < geometry.version) {
            addTemplates.push(generateOutputTemplate(geometry));
        }
        if (lastCompositeTemplate == null || lastCompositeTemplate.version < geometry.version) {
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
