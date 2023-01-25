import { GeometryConnectionData, GeometryS, InputOnlyRowT, ObjMapUndef, ProgramInclude, ProgramTextureVarMapping, RowS, TEXTURE_VAR_DATATYPE_SIZE } from "../../types";

function removeIndent(s: string, indent: number) {
    for (let i = 0; i < indent; i++) {
        const c = s.charAt(0);
        if (c != ' ') {
            break;
        }
        s = s.substring(1);
    }
    return s;
}

function getCurrentIndent(s: string) {
    const match = s.match(/^\s*/);
    return match?.[ 0 ].length || 0;
}

export function setBlockIndent(instructions: string, newIndent: number) {

    const lines = instructions
        .split('\n')
        .filter(lines => /^\s*$/.test(lines) === false);
    if (lines.length < 0) return '';

    const startIndent = getCurrentIndent(lines[ 0 ]);
    const newIndentString = ' '.repeat(newIndent);

    const unindentedLines = lines
        .map(line =>
            newIndentString + removeIndent(line, startIndent)
        );
    return unindentedLines.join('\n');
}

export function preprocessSource(
    source: string, 
    pattern: RegExp, 
    callback: (args: { source: string, index: number, length: number }) => string,
) {
    let start = 0;
    while (true) {
        const match = source.substring(start).match(pattern);
        if (match == null) break;
        source = callback({ source, index: start + match.index!, length: match[0].length });
        start += match.index! + match.length;
    }
    return source;
}

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
    textureVarMappings: ProgramTextureVarMapping[],
    textureVarRow: number[],
    geometries: ObjMapUndef<GeometryS>,
    geometryDatas: ObjMapUndef<GeometryConnectionData>,
    inPlace: boolean,
) {
    const textureVarChanges = new Map<number, number>();

    for (const mapping of textureVarMappings) {
        const startCoord = mapping.textureCoordinate;
        const size = TEXTURE_VAR_DATATYPE_SIZE[ mapping.dataType ];

        const geometry = geometries[ mapping.geometryId ];
        const geometryData = geometryDatas[ mapping.geometryId ];
        if (!geometry || !geometryData || geometry.version !== mapping.geometryVersion) {
            continue;
        }
        const node = geometry.nodes[ mapping.nodeIndex ];
        const nodeTemplate = geometryData?.nodeDatas[ mapping.nodeIndex ]?.template;
        if (!node || !nodeTemplate) {
            continue;
        }
        const rowTemplate = nodeTemplate.rows[ mapping.rowIndex ] as InputOnlyRowT;
        const row = node.rows[ rowTemplate.id ] as RowS<InputOnlyRowT>;
        if (rowTemplate.dataType !== mapping.dataType) {
            throw new Error(`Datatype mismatch`);
        }
        const value = row.value ?? rowTemplate.value;

        if (Array.isArray(value)) {
            for (let i = 0; i < size; i++) {
                const coord = startCoord + i;
                if (textureVarRow[ coord ] !== value[ i ]) {
                    textureVarChanges.set(coord, value[i]);
                }
            }
        } else if (typeof (value) === 'number') {
                if (textureVarRow[ startCoord ] !== value) {
                textureVarChanges.set(startCoord, value);
            }
        }
    }

    const newRow = inPlace ? textureVarRow : textureVarRow.slice();
    for (const [ coord, value ] of textureVarChanges) {
        newRow[coord] = value;
    }

    if (textureVarChanges.size > 0 || inPlace) {
        return newRow;
    }
}