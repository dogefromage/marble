import { GeometryS, GNodeT, GNodeTemplateCategories, GNodeTemplateTypes, NameRowT, ObjMap, ObjMapUndef, OutputRowT, RowT, RowTypes, SpecificRowT, SuperInputRowT } from "../../types";

function generateTemplate(geometry: GeometryS): GNodeT {

    const nameRow: NameRowT = {
        type: RowTypes.Name,
        id: 'name',
        name: geometry.name,
        color: '#333333',
    };

    const outputRow: OutputRowT = {
        type: RowTypes.Output,
        id: 'output',
        name: 'output',
        dataType: geometry.returnType,
    };

    const inputRows: RowT[] = geometry.arguments.map(arg => ({
        type: RowTypes.InputOnly,
        id: arg.id,
        name: arg.name,
        dataType: arg.dataType,
        value: arg.defaultValue,
    }));

    const template: GNodeT = {
        id: geometry.id,
        version: geometry.version,
        category: GNodeTemplateCategories.Composite,
        type: GNodeTemplateTypes.Composite,
        instructions: '',
        rows: [ nameRow, outputRow, ...(inputRows as SpecificRowT[]) ],
    }

    return template;
}

export default function generateCompositeTemplates(
    geometries: ObjMapUndef<GeometryS>,
    templates: ObjMapUndef<GNodeT>,
) {
    const addTemplates: GNodeT[] = [];

    const templateVersions = new Map<string, number>();
    for (const template of Object.values(templates) as GNodeT[]) {
        if (template.type !== GNodeTemplateTypes.Composite) {
            continue;
        }
        templateVersions.set(template.id, template.version);
    }

    for (const geometry of Object.values(geometries)) {
        if (!geometry || geometry?.isRoot) {
            continue;
        }
        const templateVersion = templateVersions.get(geometry.id);
        templateVersions.delete(geometry.id);
        if (templateVersion == null || templateVersion < geometry.version) {
            addTemplates.push(generateTemplate(geometry));
        }
    }

    // keys that remain must be removed since their geometry does not exist anymore
    const removeTemplateIds: string[] = [ ...templateVersions.keys() ];

    return {
        addTemplates,
        removeTemplateIds,
    };
}
