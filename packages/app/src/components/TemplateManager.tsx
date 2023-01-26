import { useEffect } from 'react';
import includeSource from '../../assets/includes.glsl?raw';
import defaultTemplates from '../content/defaultTemplates';
import { useAppDispatch, useAppSelector } from '../redux/hooks';
import { selectGeometries } from '../slices/geometriesSlice';
import { selectTemplates, templatesAddGLSLSnippets, templatesAddTemplates, templatesRemoveTemplates } from '../slices/templatesSlice';
import { splitIncludesFromSource } from '../utils/layerPrograms';
import generateDynamicTemplates from '../utils/templateManager/generateCompositeTemplates';

const TemplateManager = () =>
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
        const templateChanges = generateDynamicTemplates(geometries, templates);
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

export default TemplateManager;