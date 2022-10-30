import React, { useEffect } from 'react';
import defaultProgramIncludes from '../assets/defaultIncludes';
import defaultTemplates from '../assets/defaultTemplates';
import { useAppDispatch } from '../redux/hooks';
import { templatesAddGLSLSnippet, templatesAddTemplate } from '../slices/templatesSlice';

interface Props
{

}

const DefaultTemplateLoader = ({ }: Props) =>
{
    const dispatch = useAppDispatch();

    useEffect(() =>
    {
        for (const template of defaultTemplates)
        {
            dispatch(templatesAddTemplate({
                template,
            }));
        }
        
        for (const glsl of defaultProgramIncludes)
        {
            dispatch(templatesAddGLSLSnippet({
                glslSnippet: glsl,
            }));
        }
    }, [ dispatch ]);

    return null;
}

export default DefaultTemplateLoader;