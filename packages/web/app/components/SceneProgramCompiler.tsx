import { useEffect, useMemo } from 'react';
import { LOOKUP_TEXTURE_SIZE } from '../classes/ViewportQuadProgram';
import { useAppDispatch, useAppSelector } from '../redux/hooks';
import { selectGeometries } from '../slices/geometriesSlice';
import { sceneProgramSetLookup, sceneProgramSetProgram, selectSceneProgram } from '../slices/sceneProgramSlice';
import { selectTemplates } from '../slices/templatesSlice';
import { DataTypes, InputOnlyRowT, TEXTURE_VAR_DATATYPE_SIZE } from '../types';
import { assertRowHas } from '../utils/geometries/assertions';
import zipGeometry from '../utils/geometries/zipGeometry';
import { compileGeometries, GeometriesCompilationError } from '../utils/sceneProgram/compileGeometries';

const SceneProgramCompiler = () =>
{
    const dispatch = useAppDispatch();
    const geometries = useAppSelector(selectGeometries);
    const { templates, glslSnippets } = useAppSelector(selectTemplates);
    const geoZero = Object.values(geometries)[0];
    const { program, textureVarLookupData } = useAppSelector(selectSceneProgram);

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
            const newProgram = compileGeometries(zipped, glslSnippets, { current: 0 });
            dispatch(sceneProgramSetProgram({
                program: newProgram,
            }));
        }
        catch (e)
        {
            if (e instanceof GeometriesCompilationError)
                console.error(`Geometry could not be compiled: ${e.type}`);
            else
                throw e;
        }

    }, [ 
        zipped?.id, 
        zipped?.compilationValidity 
    ]);

    useEffect(() =>
    {
        if (!textureVarLookupData)
        {
            const lookup = new Array(LOOKUP_TEXTURE_SIZE * LOOKUP_TEXTURE_SIZE).fill(0);
            dispatch(sceneProgramSetLookup({
                lookup,
            }));
            return;
        }

        if (!program || !zipped)
            return;

        for (const mapping of Object.values(program.textureVarMappings))
        {
            const node = zipped.nodes[mapping.nodeIndex];
            const row = node?.rows[mapping.rowIndex];

            if (!row)
            {
                console.warn(`Row not found while mapping textureVars`);
                continue;
            };

            if (!assertRowHas<InputOnlyRowT>(row, 'value'))
            {
                console.error(`Row must be input row`);
                continue;
            }
            
            if (mapping.dataTypes === DataTypes.Vec2 ||
                mapping.dataTypes === DataTypes.Vec3)
            {
                const valueList = row.value as number[];
                const size = TEXTURE_VAR_DATATYPE_SIZE[mapping.dataTypes];

                for (let i = 0; i < size; i++)
                {
                    const index = mapping.textureCoordinate + i;
                    textureVarLookupData[index] = valueList[i];
                }
            }
            else if (mapping.dataTypes === DataTypes.Float)
            {
                textureVarLookupData[mapping.textureCoordinate] = row.value as number;
            }
        }
        
        console.log(textureVarLookupData);
            
    }, [ 
        program, 
        textureVarLookupData, 
        zipped?.id,
        zipped?.rowStateValidity, 
    ]);

    return null;
}

export default SceneProgramCompiler;