import { useEffect } from 'react';
import { useAppSelector } from '../redux/hooks';
import { selectApp } from '../slices/appSlice';
import { storeLocalProjectJson } from '../utils/projectStorage';

interface Props {

}

const ProjectLoader = ({}: Props) => {
    const app = useAppSelector(selectApp);

    useEffect(() => {
        if (!app.projectToLoad) {
            return;
        }
        storeLocalProjectJson(app.projectToLoad.data);
        location.reload();
    }, [ app.projectToLoad ]);

    return null;
}

export default ProjectLoader;