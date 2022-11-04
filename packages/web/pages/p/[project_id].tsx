import { useRouter } from 'next/router';
import AppRoot from '../../app/components/AppRoot';

const ProjectPage = () =>
{
    const router = useRouter()
    const { project_id } = router.query;

    return (
        <AppRoot projectId={project_id as string} />
    );
}

export default ProjectPage;