import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../redux/hooks';
import { selectGeometries } from '../slices/geometriesSlice';
import { sceneProgramSetProgram } from '../slices/sceneProgramSlice';
import { selectTemplates } from '../slices/templatesSlice';
import zipGeometry from '../utils/geometries/zipGeometry';
import { compileGeometries, GeometriesCompilationError } from '../utils/sceneProgram/compileGeometries';

const SceneProgramCompiler = () =>
{
    const dispatch = useAppDispatch();

    const geometries = useAppSelector(selectGeometries);
    const { templates, glslSnippets } = useAppSelector(selectTemplates);

    const geoZero = Object.values(geometries)[0];
    
    useEffect(() =>
    {
        if (!geoZero)
        {
            dispatch(sceneProgramSetProgram({
                program: null,
            }));
            return;
        }

        const zippedGeometry = zipGeometry(geoZero, templates);

        try
        {
            const program = compileGeometries(zippedGeometry, glslSnippets, 0);

            dispatch(sceneProgramSetProgram({
                program,
            }));
        }
        catch (e)
        {
            if (e instanceof GeometriesCompilationError)
                console.error(`Geometry could not be compiled: ${e.type}`);
            else
                throw e;
        }

    }, [ geoZero?.compilationValidity, templates ]);

    useEffect(() =>
    {
        // compilation: geometry => programConstants
        // rowState updated: geometry => programConstants

        // generation: programConstants => texture

        
        
    }, [ geoZero?.rowStateValidity ]);

    return null;
}

export default SceneProgramCompiler;