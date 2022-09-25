import React, { useEffect } from 'react';
import { compileGeometries, GeometriesCompilationError } from '../utils/sceneProgram/compileGeometries';
import { useAppDispatch, useAppSelector } from '../redux/hooks';
import { selectGeometries } from '../slices/geometriesSlice';
import { sceneProgramSetProgram } from '../slices/sceneProgramSlice';
import { NODE_TEMPLATES } from '../utils/geometries/testingTemplates';
import zipGeometry from '../utils/geometries/zipGeometry';

const SceneProgramCompiler = () =>
{
    const dispatch = useAppDispatch();
    const geometries = useAppSelector(selectGeometries);

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

        const zippedGeometry = zipGeometry(geoZero, NODE_TEMPLATES);

        try
        {
            const program = compileGeometries(zippedGeometry);

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

    }, [ geoZero?.validity ])

    return null;
}

export default SceneProgramCompiler;