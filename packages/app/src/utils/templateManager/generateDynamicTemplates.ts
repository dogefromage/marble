import { rowMeta } from "../../components/GeometryRowRoot";
import { BaseInputRowT, decomposeTemplateId, defaultDataTypeValue, GeometryS, getTemplateId, GNodeTemplate, GNodeTemplateTypes, NameRowT, ObjMapUndef, PassthroughRowT, SpecificRowT } from "../../types";
import { prefixGeometryFunction } from "../layerPrograms";
import { createReturntypePlaceholder, getStructurePropertyKey } from "../layerPrograms/generateCodeStatements";
import { parseTemplateInstructions } from "../layerPrograms/parsing";

// function generateCompositeInstructions(geometry: GeometryS) {
//     const { inputs, outputs } = geometry;
//     if (outputs.length === 0) {
//         return '';
//     }

//     const instructionInputArgs = inputs.map(input => input.id).join(', ');
//     const functionName = prefixGeometryFunction(geometry.id);
//     const functionInvoc = `${functionName}(${instructionInputArgs})`;
//     const returnType = createReturntypePlaceholder(geometry.outputs);

//     if (outputs.length === 1) {
//         return `${returnType} ${outputs[0].id} = ${functionInvoc};`; 
//     } else {
//         const invocStatement = `${returnType} res = ${functionInvoc};`;
//         const destructuringStatements = outputs.map((output, index) => 
//             `${output.dataType} ${output.id} = res.${getStructurePropertyKey(index)};`
//         );
//         return [ invocStatement, ...destructuringStatements ].join('\n');
//     }
// }

// function generateCompositeTemplate(geometry: GeometryS): GNodeTemplate {
//     const nameRow: NameRowT = {
//         type: 'name',
//         id: 'name',
//         name: geometry.name,
//         color: '#333333',
//     };
//     const instructions = generateCompositeInstructions(geometry);

//     const template: GNodeTemplate = {
//         id: getTemplateId('composite', geometry.id),
//         version: geometry.version,
//         category: 'composite',
//         instructions,
//         rows: [ 
//             nameRow,
//             ...geometry.outputs as SpecificRowT[],
//             ...geometry.inputs as SpecificRowT[],
//         ],
//     }
//     return template;
// }

// function generateInputTemplate(geometry: GeometryS, inputId: string) {
//     const input = geometry.inputs.find(input => input.id === inputId);
//     if (!input) {
//         throw new Error(`Row should exist`);
//     }

//     const templateIdentifier = [ geometry.id, input.id ].join(':');
//     const templateId = getTemplateId('input', templateIdentifier);
//     const row: PassthroughRowT = {
//         id: 'passthrough',
//         name: input.name,
//         type: 'passthrough',
//         dataType: input.dataType,
//         defaultArgumentToken: input.id,
//         value: defaultDataTypeValue[input.dataType],
//     }
//     /**
//      * The compiler will replace the declaration of passthrough with a symbol for the output joint,
//      * The reference on the rhs will be replaced with either the defaultArgumentToken or the connected input.
//      */
//     const instructions = `${input.dataType} passthrough = passthrough;`;
//     const template: GNodeTemplate = {
//         id: templateId,
//         category: 'input',
//         version: geometry.version,
//         rows: [ row as SpecificRowT ],
//         instructions,
//     }
//     return template;
// }

function generateOutputTemplate(geometry: GeometryS): GNodeTemplate {

    const templateId = getTemplateId('output', geometry.id);

    const inputRows: BaseInputRowT[] = geometry.outputs.map(output => {
        return {
            id: output.id,
            type: 'input',
            name: output.name,
            dataType: output.dataType,
            value: defaultDataTypeValue[output.dataType],
        }
    });

    if (geometry.outputs.length > 1) {
        throw new Error(`TODO`);
    }
    const [ output ] = geometry.outputs;
    
    // TODO: make less stupid
    const instructions = parseTemplateInstructions(`
        ${output.dataType} ${geometry.id}_output(${output.dataType} ${output.id}) {
            return ${output.id};
        }
    `);

    // /**
    //  * calls and returns a constructor function of a 
    //  * placeholder datatype which will be overwritten during compilation.
    //  */    
    // const outputIdentifierList = geometry.outputs.map(output => output.id).join(', ');
    // const returnType = createReturntypePlaceholder(geometry.outputs);
    // let instructions = '';
    // if (geometry.outputs.length === 1) {
    //     instructions = `return ${outputIdentifierList};`;
    // } else if (geometry.outputs.length > 1) {
    //     instructions = `return ${returnType}(${outputIdentifierList});`;
    // }

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
        const dynamicTemplateTypes: GNodeTemplateTypes[] = [ 'composite', 'output', 'input' ];
        if (dynamicTemplateTypes.includes(templateType)) {
            lastTemplates.set(template.id, template);
        }
    }

    const addTemplates: GNodeTemplate[] = [];

    for (const geometry of Object.values(geometries) as GeometryS[]) {
        const inputPassthroughIds = geometry.inputs.map(input =>
            getTemplateId('input', [ geometry.id, input.id ].join(':'))
        );
        const geometryTemplateIds = [
            getTemplateId('output', geometry.id),
            // getTemplateId('composite', geometry.id),
            // ...inputPassthroughIds,
        ];

        for (const templateId of geometryTemplateIds) {
            const lastTemplate = lastTemplates.get(templateId);
            lastTemplates.delete(templateId);
            if (lastTemplate == null || lastTemplate.version < geometry.version) {
                let newTemplate: GNodeTemplate | null = null;
                const { type: templateType, id: identifier } = decomposeTemplateId(templateId);
                switch (templateType) {
                    // case 'composite':
                    //     newTemplate = generateCompositeTemplate(geometry);
                    //     break;
                    case 'output':
                        newTemplate = generateOutputTemplate(geometry);
                        break;
                    // case 'input':
                    //     const inputId = identifier.split(':')[1];
                    //     newTemplate = generateInputTemplate(geometry, inputId);
                }
                if (newTemplate != null) {
                    addTemplates.push(newTemplate);
                }
            }
        }
    }

    // keys that remain must be removed since their geometry does not exist anymore
    const removeTemplateIds: string[] = [ ...lastTemplates.keys() ];

    return {
        addTemplates,
        removeTemplateIds,
    };
}
