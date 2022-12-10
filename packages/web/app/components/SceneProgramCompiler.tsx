import { useEffect, useMemo } from 'react';
import { useAppDispatch, useAppSelector } from '../redux/hooks';
import { selectGeometries } from '../slices/geometriesSlice';
import { sceneProgramSetLookupSubarray, sceneProgramSetProgram, selectSceneProgram } from '../slices/sceneProgramSlice';
import { selectTemplates } from '../slices/templatesSlice';
import { DataTypes, GeometryS, ProgramInclude, SceneProgram, TEXTURE_VAR_DATATYPE_SIZE } from '../types';
import { Counter } from '../utils/Counter';
import generateGeometryConnectionData from '../utils/geometries/generateGeometryConnectionData';
import { GeometriesCompilationError } from '../utils/sceneProgram/compilationError';
import { compileGeometry } from '../utils/sceneProgram/compileGeometry';
import temporaryPushError from '../utils/temporaryPushError';
import { LOOKUP_TEXTURE_SIZE } from '../utils/viewport/ViewportQuadProgram';

const SceneProgramCompiler = () =>
{
    const dispatch = useAppDispatch();
    const geometries = useAppSelector(selectGeometries);
    const { templates, programIncludes } = useAppSelector(selectTemplates);
    const { program } = useAppSelector(selectSceneProgram);

    const geometry: GeometryS | undefined = Object.values(geometries)?.[0];
    const connectionData = useMemo(() => 
    {
        if (!geometry || !templates || !Object.values(templates).length) return;
        try {
            return generateGeometryConnectionData(geometry, templates);
        } catch (e) {
            console.error(e);
        }
    }, [ geometry?.id, geometry?.compilationValidity, templates ]);
    
    useEffect(() =>
    {
        if (!connectionData || !geometry) return;

        try
        {
            const textureCoordCounter = new Counter(LOOKUP_TEXTURE_SIZE * LOOKUP_TEXTURE_SIZE);
            const geometryMethodCode = compileGeometry(geometry, connectionData, textureCoordCounter);

            const usedIncludes: ProgramInclude[] = [];
            geometryMethodCode.includedTokens.forEach(includeToken => 
            {
                const include = programIncludes[includeToken];
                if (!include) return console.error(`Include missing "${includeToken}"`);
                usedIncludes.push(include);
            })

            const program: SceneProgram = 
            {
                rootMethod: geometryMethodCode,
                includes: usedIncludes,
            }
            
            dispatch(sceneProgramSetProgram({
                program,
            }));
        }
        catch (e)
        {
            if (e instanceof GeometriesCompilationError)
            {
                temporaryPushError(`Geometry could not be compiled: ${e.msg}`);
            }
            else
            {
                throw e;
            }
        }

    }, [ 
        geometry?.id,
        connectionData,
    ]);

    useEffect(() =>
    {
        if (!program || !geometry || !connectionData)
            return;

        if (program.rootMethod.geometryId !== geometry.id ||
            connectionData.geometryId !== geometry.id)
            return;
        
        if (program.rootMethod.compilationValidity !== geometry.compilationValidity ||
            connectionData.compilationValidity !== geometry.compilationValidity)
            return;

        for (const mapping of Object.values(program.rootMethod.textureVarMappings))
        {
            const nodeState = geometry.nodes[mapping.nodeIndex];
            const template = connectionData.templateMap.get(nodeState.id)!;
            const rowT = template.rows[mapping.rowIndex];
            const rowS = nodeState.rows[rowT.id];

            const rowValue: number | number[] = (rowS as any).value || (rowT as any).value;

            let subArray: number[];
            
            if (mapping.dataTypes === DataTypes.Vec2 ||
                mapping.dataTypes === DataTypes.Vec3 ||
                mapping.dataTypes === DataTypes.Mat3)
            {
                subArray = rowValue as number[];
                const size = TEXTURE_VAR_DATATYPE_SIZE[mapping.dataTypes];
                if (!Array.isArray(subArray) || !(subArray.length === size)) continue;
            }
            else if (mapping.dataTypes === DataTypes.Float)
            {
                subArray = [ rowValue as number ];
            }
            else
            {
                console.error(`Unknown datatype`);
                continue;
            }

            dispatch(sceneProgramSetLookupSubarray({
                startCoordinate: mapping.textureCoordinate,
                subArray,
            }));
        }
    }, [ 
        geometry?.id,
        geometry?.rowStateValidity,
        program,
        connectionData,
    ]);

    return null;
}

export default SceneProgramCompiler;