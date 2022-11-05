import { useEffect, useMemo } from 'react';
import { useAppDispatch, useAppSelector } from '../redux/hooks';
import { selectGeometries } from '../slices/geometriesSlice';
import { sceneProgramSetLookupSubarray, sceneProgramSetProgram, selectSceneProgram } from '../slices/sceneProgramSlice';
import { selectTemplates } from '../slices/templatesSlice';
import { DataTypes, InputOnlyRowT, TEXTURE_VAR_DATATYPE_SIZE } from '../types';
import { Counter } from '../utils/Counter';
import { assertRowHas } from '../utils/geometries/assertions';
import zipGeometry from '../utils/geometries/zipGeometry';
import { GeometriesCompilationError } from '../utils/sceneProgram/compilationError';
import { compileGeometries } from '../utils/sceneProgram/compileGeometries';
import { LOOKUP_TEXTURE_SIZE } from '../utils/viewport/ViewportQuadProgram';

const SceneProgramCompiler = () =>
{
    const dispatch = useAppDispatch();
    const geometries = useAppSelector(selectGeometries);
    const { templates, glslSnippets } = useAppSelector(selectTemplates);
    const geoZero = Object.values(geometries)[0];
    const { program } = useAppSelector(selectSceneProgram);

    const zipped = useMemo(() => 
    {
        if (!geoZero) return;
        return zipGeometry(geoZero, templates);
    }, [ 
        geoZero?.id,
        geoZero?.rowStateValidity, 
        geoZero?.compilationValidity, 
        templates 
    ]);
    
    useEffect(() =>
    {
        if (!zipped) return;

        try
        {
            const textureCoordCounter = new Counter(LOOKUP_TEXTURE_SIZE * LOOKUP_TEXTURE_SIZE);
            const newProgram = compileGeometries(zipped, glslSnippets, textureCoordCounter);
            dispatch(sceneProgramSetProgram({
                program: newProgram,
            }));
        }
        catch (e)
        {
            if (e instanceof GeometriesCompilationError)
            {
                // console.info(`Geometry could not be compiled: ${e.type}`);
            }
            else
            {
                throw e;
            }
        }

    }, [ 
        zipped?.id, 
        zipped?.compilationValidity 
    ]);

    useEffect(() =>
    {
        if (!program || !zipped)
            return;

        for (const mapping of Object.values(program.textureVarMappings))
        {
            const node = zipped.nodes[mapping.nodeIndex];
            const row = node?.rows[mapping.rowIndex];

            // can happen because zipped and program are not necessarily equivalend
            if (!row) continue;
            if (!assertRowHas<InputOnlyRowT>(row, 'value')) continue;

            let subArray: number[];
            
            if (mapping.dataTypes === DataTypes.Vec2 ||
                mapping.dataTypes === DataTypes.Vec3)
            {
                subArray = row.value as number[];
                const size = TEXTURE_VAR_DATATYPE_SIZE[mapping.dataTypes];
                if (!Array.isArray(subArray) || !(subArray.length === size)) continue;
            }
            else if (mapping.dataTypes === DataTypes.Float)
            {
                if (typeof(row.value) !== 'number') continue;
                subArray = [ row.value ];
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
        program, 
        zipped?.id,
        zipped?.rowStateValidity, 
        zipped?.compilationValidity,
    ]);

    return null;
}

export default SceneProgramCompiler;