import { BaseInputRowT, dataTypeDescriptors, decomposeTemplateId, GeometryS, getTemplateId, GNodeTemplate, GNodeTemplateTypes, initialDataTypeValue, NameRowT, ObjMapUndef, PassthroughRowT, SpecificRowT } from "../../types";
import { glsl } from "../codeStrings";
import { generateDataTypeText } from "../layerPrograms/generateCodeStatements";
import { GeometryContext } from "../layerPrograms/GeometryContext";

function generateCompositeInstructions(geometry: GeometryS) {
    const { inputs, outputs } = geometry;
    if (outputs.length !== 1) {
        return '';
    }
    const [ output ] = outputs;

    const templateInputParams = new Array<string>();
    const templateInputArgs = new Array<string>();
    for (const input of inputs) {
        const type = generateDataTypeText(input.dataType);
        templateInputParams.push(`${type} ${input.id}`);
        templateInputArgs.push(input.id);
    }

    const functionName = GeometryContext.getIdentifierName('geometry', geometry.id);
    const returnType = generateDataTypeText(output.dataType);
    const dataTypeDescriptor = dataTypeDescriptors[output.dataType];

    let expression: string;
    if (dataTypeDescriptor.type === 'lambda') {
        const lambdaArgs = new Array<string>();
        const lambdaParams = new Array<string>();
        for (let i = 0; i < dataTypeDescriptor.parameterTypes.length; i++) {
            const arg = `arg_${i}`;
            const param = `${dataTypeDescriptor.parameterTypes[i]} ${arg}`;
            lambdaArgs.push(arg);
            lambdaParams.push(param);
        }
        const allArgs = [ ...templateInputArgs, ...lambdaArgs ];
        expression = `lambda (${lambdaParams.join(', ')}) : ${functionName}(${allArgs.join(', ')})`;
    } else {
        expression = `${functionName}(${templateInputArgs.join(', ')})`;
    }

    const instructions = glsl`
        ${returnType} dynamic_composite(${templateInputParams.join(', ')}) {
            return ${expression};
        }
    `;
    return instructions;

    // if (outputs.length === 1) {
    // } else {
    //     const invocStatement = `${returnType} res = ${functionInvoc};`;
    //     const destructuringStatements = outputs.map((output, index) => 
    //         `${output.dataType} ${output.id} = res.${getStructurePropertyKey(index)};`
    //     );
    //     return [ invocStatement, ...destructuringStatements ].join('\n');
    // }
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
        id: getTemplateId('composite', geometry.id),
        version: geometry.version,
        category: 'composite',
        instructions,
        rows: [ 
            nameRow,
            ...geometry.outputs as SpecificRowT[],
            ...geometry.inputs as SpecificRowT[],
        ],
    }
    return template;
}

function generateInputInstructions(geometry: GeometryS, inputId: string) {
    const row = geometry.inputs.find(input => input.id === inputId)!;
    const returnType = generateDataTypeText(row.dataType);

    const instructions = glsl`
        ${returnType} dynamic_input(${returnType} ${row.id}) {
            return ${row.id};
        }
    `;
    return instructions;
}

function generateInputTemplate(geometry: GeometryS, inputId: string) {
    const input = geometry.inputs.find(input => input.id === inputId);
    if (!input) {
        throw new Error(`Row should exist`);
    }

    const templateIdentifier = [ geometry.id, input.id ].join(':');
    const templateId = getTemplateId('input', templateIdentifier);
    const row: PassthroughRowT = {
        id: input.id,
        name: input.name,
        type: 'passthrough',
        dataType: input.dataType,
        defaultParameter: input.id,
        value: initialDataTypeValue[input.dataType],
    }
    
    const template: GNodeTemplate = {
        id: templateId,
        category: 'input',
        version: geometry.version,
        rows: [ row as SpecificRowT ],
        instructions: generateInputInstructions(geometry, inputId),
    }
    return template;
}

function generateOutputInstructions(geometry: GeometryS) {
    if (geometry.outputs.length !== 1) {
        console.error(`Implement != 1 output`);
        return '';
    }

    const [ outputInput ] = geometry.outputs;
    const typeName = generateDataTypeText(outputInput.dataType);

    return glsl`
        ${typeName} output(${typeName} ${outputInput.id}) {
            return ${outputInput.id};
        }
    `;
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
}

function generateOutputTemplate(geometry: GeometryS): GNodeTemplate {

    const templateId = getTemplateId('output', geometry.id);

    const inputRows: BaseInputRowT[] = geometry.outputs.map(output => {
        return {
            id: output.id,
            type: 'input',
            name: output.name,
            dataType: output.dataType,
            value: initialDataTypeValue[output.dataType],
        }
    });

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
        instructions: generateOutputInstructions(geometry),
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
            getTemplateId('composite', geometry.id),
            ...inputPassthroughIds,
        ];

        for (const templateId of geometryTemplateIds) {
            const lastTemplate = lastTemplates.get(templateId);
            lastTemplates.delete(templateId);
            if (lastTemplate == null || lastTemplate.version < geometry.version) {
                let newTemplate: GNodeTemplate | null = null;
                const { type: templateType, id: identifier } = decomposeTemplateId(templateId);
                switch (templateType) {
                    case 'composite':
                        newTemplate = generateCompositeTemplate(geometry);
                        break;
                    case 'output':
                        newTemplate = generateOutputTemplate(geometry);
                        break;
                    case 'input':
                        const inputId = identifier.split(':')[1];
                        newTemplate = generateInputTemplate(geometry, inputId);
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
