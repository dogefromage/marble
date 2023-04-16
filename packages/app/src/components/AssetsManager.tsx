import { useEffect } from 'react';
import testingTemplates from '../glsl/test.template.glsl';
import { useAppDispatch } from '../redux/hooks';
import { assetsAddTemplates } from '../slices/assetsSlice';

interface Props {
 
}

const AssetsManager = ({}: Props) => {
    const dispatch = useAppDispatch();

    useEffect(() => {
        dispatch(assetsAddTemplates({
            templates: testingTemplates,
        }));
    }, [ testingTemplates ]);

    return null;
}

export default AssetsManager;