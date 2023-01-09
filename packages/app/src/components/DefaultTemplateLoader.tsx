import React, { useEffect } from 'react';
import defaultProgramIncludes from '../assets/defaultIncludes';
import defaultTemplates from '../assets/defaultTemplates';
import { useAppDispatch } from '../redux/hooks';
import { templatesAddGLSLSnippets, templatesAddTemplates } from '../slices/templatesSlice';

interface Props
{

}

const DefaultTemplateLoader = ({ }: Props) =>
{
    const dispatch = useAppDispatch();
    useEffect(() =>
    {
        dispatch(templatesAddTemplates({
            templates: defaultTemplates,
        }));
        dispatch(templatesAddGLSLSnippets({
            glslSnippets: defaultProgramIncludes,
        }));
    }, [ dispatch ]);
    
    return null;
}

export default DefaultTemplateLoader;