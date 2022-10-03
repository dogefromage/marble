import React, { useEffect } from 'react';
import defaultGlslSnippets from '../assets/defaultGlslSnippets';
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
        
        for (const glsl of defaultGlslSnippets)
        {
            dispatch(templatesAddGLSLSnippet({
                glslSnippet: glsl,
            }));
        }
    }, [ dispatch ]);

    return null;
}

export default DefaultTemplateLoader;