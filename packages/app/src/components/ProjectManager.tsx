import { validateProject } from '@marble/language';
import { useEffect, useRef } from 'react';
import { useAppDispatch, useAppSelector } from '../redux/hooks';
import { validationSetResult } from '../slices/contextSlice';
import { selectFlows } from '../slices/flowsSlice';
import { selectLayers } from '../slices/layersSlice';
import { ProgramEmitter } from '../utils/layerPrograms/ProgramEmitter';
import { objMap } from '../utils/data';
import { layerProgramsSetMany } from '../slices/layerProgramsSlice';
import { selectProjectEnvironment } from '../slices/projectEnvironmentSlice';

interface Props {

}

const ProjectManager = ({}: Props) => {
    const dispatch = useAppDispatch();
    const flows = useAppSelector(selectFlows);
    const layers = useAppSelector(selectLayers);
    const projectEnvironment = useAppSelector(selectProjectEnvironment);
    const programEmitter = useRef(new ProgramEmitter());

    useEffect(() => {
        const topFlowsPerLayer = objMap(layers, l => l.topFlowId);
        const projectContext = validateProject(flows, projectEnvironment, topFlowsPerLayer);
        dispatch(validationSetResult({
            context: projectContext,
        }));

        const newPrograms = programEmitter.current
            .emitPrograms(projectContext, layers);

        dispatch(layerProgramsSetMany({
            setPrograms: newPrograms,
            removePrograms: [], // TODO
        }));
    }, [ layers, flows ]);

    return null;
}

export default ProjectManager;