import React, { useEffect } from 'react';
import defaultTemplates from '../content/defaultTemplates';
import { useAppDispatch, useAppSelector } from '../redux/hooks';
import { selectTemplates, templatesAddGLSLSnippets, templatesAddTemplates, templatesRemoveTemplates } from '../slices/templatesSlice';
import includeSource from '../../assets/includes.glsl?raw';
import splitIncludesFromSource from '../utils/program/splitIncludesFromSource';
import { selectGeometries } from '../slices/geometriesSlice';
import generateCompositeTemplates from '../utils/program/generateCompositeTemplates';

const TemplateManagerRoot = () =>
{
    const dispatch = useAppDispatch();
    const geometries = useAppSelector(selectGeometries);
    const { templates } = useAppSelector(selectTemplates);

    useEffect(() =>
    {
        dispatch(templatesAddTemplates({
            templates: defaultTemplates,
        }));

        const defaultIncludes = splitIncludesFromSource(includeSource);
        dispatch(templatesAddGLSLSnippets({
            includes: defaultIncludes,
        }));
    }, [ dispatch ]);

    useEffect(() => {
        const templateChanges = generateCompositeTemplates(geometries, templates);
        if (templateChanges.addTemplates.length > 0) {
            dispatch(templatesAddTemplates({
                templates: templateChanges.addTemplates,
            }));
        }
        if (templateChanges.removeTemplateIds.length > 0) {
            dispatch(templatesRemoveTemplates({
                templateIds: templateChanges.removeTemplateIds,
            }));
        }
    }, [ templates, geometries ]);
    
    return null;
}

export default TemplateManagerRoot;