import React, { useEffect } from 'react';
import { compileGeometries, GeometriesCompilationError } from '../utils/sceneProgram/compileGeometries';
import { useAppDispatch, useAppSelector } from '../redux/hooks';
import { selectGeometries } from '../slices/geometriesSlice';
import { sceneProgramSetProgram } from '../slices/sceneProgramSlice';
import zipGeometry from '../utils/geometries/zipGeometry';
import { selectTemplates } from '../slices/templatesSlice';

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
            const program = compileGeometries(zippedGeometry, glslSnippets);

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

    }, [ geoZero?.validity, templates ])

    return null;
}

export default SceneProgramCompiler;