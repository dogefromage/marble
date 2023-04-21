import { useEffect } from 'react';
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