import { BaseInputRowT, dataTypeDescriptors, DataTypeValueTypes, GeometryConnectionData, GeometryS, ObjMapUndef, ProgramInclude, ProgramDynamicLookupMapping, RowS, SimpleDataTypes, textureVarDatatypeSize } from "../../types";
import { LOOKUP_TEXTURE_WIDTH } from "../viewportView/GLProgramRenderer";

export function splitIncludesFromSource(source: string) {
    const matches = [ ...source.matchAll(/#\s*DEFINCLUDE\s+(\w+);/g) ];
    const includes: ProgramInclude[] = [];

    for (let i = matches.length - 1; i >= 0; i--) {

        const lastMatchIndex = matches[i].index!;
        const sourceStart = lastMatchIndex + matches[i][0].length; // add offset of marker preprocessor
        const includeSrc = source.substring(sourceStart);
        // reduce source
        source = source.substring(0, lastMatchIndex);

        includes.push({
            id: matches[i][1]!,
            source: includeSrc,
        });
    }

    return includes;
}

export function mapDynamicValues(
    textureVarMappings: ProgramDynamicLookupMapping[],
    geometries: ObjMapUndef<GeometryS>,
    geometryDatas: ObjMapUndef<GeometryConnectionData>,
    lastTextureVarRow?: number[],
) {
    const textureVarChanges = new Map<number, number>();
    
    const isInitial = lastTextureVarRow == null;
    let textureVarRow = lastTextureVarRow || new Array<number>(LOOKUP_TEXTURE_WIDTH).fill(0);

    for (const mapping of textureVarMappings) {
        const { 
            geometryId, 
            geometryVersion,
            textureCoordinate, 
            dataType, 
            nodeIndex,
        } = mapping;

        const size = textureVarDatatypeSize[ dataType ];
        const descriptor = dataTypeDescriptors[dataType];
        if (descriptor.type !== 'simple') {
            throw new Error(`Illegal mapping`);
        }

        const geometry = geometries[ geometryId ];
        const geometryData = geometryDatas[ geometryId ];
        if (!geometry || !geometryData || geometry.version !== geometryVersion) {
            continue;
        }
        const node = geometry.nodes[ nodeIndex ];
        const nodeTemplate = geometryData?.nodeDatas[ mapping.nodeIndex ]?.template;
        if (!node || !nodeTemplate) {
            continue;
        }
        const rowTemplate = nodeTemplate.rows[ mapping.rowIndex ] as BaseInputRowT;
        const row = node.rows[ rowTemplate.id ] as RowS<BaseInputRowT>;
        if (rowTemplate.dataType !== mapping.dataType) {
            throw new Error(`Datatype mismatch`);
        }
        const value = (row?.value ?? rowTemplate.value) as DataTypeValueTypes[SimpleDataTypes]

        if (Array.isArray(value)) {
            for (let i = 0; i < size; i++) {
                const coord = textureCoordinate + i;
                if (textureVarRow[ coord ] !== value[ i ]) {
                    textureVarChanges.set(coord, value[i]);
                }
            }
        } else if (typeof (value) === 'number') {
                if (textureVarRow[textureCoordinate] !== value) {
                textureVarChanges.set(textureCoordinate, value);
            }
        }
    }

    if (textureVarChanges.size > 0 && !isInitial) {
        textureVarRow = textureVarRow.slice();
    }
    for (const [ coord, value ] of textureVarChanges) {
        textureVarRow[coord] = value;
    }
    return textureVarRow;
}
