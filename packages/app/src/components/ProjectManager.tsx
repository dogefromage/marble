import { validateProject } from '@marble/language';
import { useEffect, useRef } from 'react';
import { useAppDispatch, useAppSelector } from '../redux/hooks';
import { validationSetResult } from '../slices/contextSlice';
import { selectFlows } from '../slices/flowsSlice';
import { layerProgramsSetMany } from '../slices/layerProgramsSlice';
import { selectLayers } from '../slices/layersSlice';
import { initialEnvironment } from '../types/flows/setup';
import { ProgramEmitter } from '../utils/layerPrograms/ProgramEmitter';

interface Props {

}

const ProjectManager = ({}: Props) => {
    const dispatch = useAppDispatch();
    const flows = useAppSelector(selectFlows);
    const layers = useAppSelector(selectLayers);
    // const projectEnvironment = useAppSelector(selectProjectEnvironment);
    const projectEnvironment = initialEnvironment;
    const programEmitter = useRef(new ProgramEmitter());

    const lastEmissionTimeoutRef = useRef<any>();

    useEffect(() => {
        const projectContext = validateProject(flows, projectEnvironment, layers);
        dispatch(validationSetResult({
            context: projectContext,
        }));

        const EMISSION_DELAY = 100;
        if (lastEmissionTimeoutRef.current) {
            clearTimeout(lastEmissionTimeoutRef.current);
        }
        lastEmissionTimeoutRef.current = setTimeout(() => {
            const newPrograms = programEmitter.current
                .emitPrograms(projectContext, layers);
            dispatch(layerProgramsSetMany({
                setPrograms: newPrograms,
                removePrograms: [], // TODO
            }));
        }, EMISSION_DELAY);
    }, [ layers, flows ]);

    return null;
}

export default ProjectManager;