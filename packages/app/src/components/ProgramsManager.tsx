import { validateProject } from '@marble/language';
import { useEffect, useRef } from 'react';
import { useAppDispatch, useAppSelector } from '../redux/hooks';
import { validationSetResult } from '../slices/contextSlice';
import { selectFlows } from '../slices/flowsSlice';
import { selectLayers } from '../slices/layersSlice';
import { baseEnvironment } from '../types/flows';
import { ProgramEmitter } from '../utils/layerPrograms/ProgramEmitter';
import { objMap } from '../utils/data';
import { layerProgramsSetMany } from '../slices/layerProgramsSlice';

interface Props {

}

const ProgramsManager = ({}: Props) => {
    const dispatch = useAppDispatch();
    const flows = useAppSelector(selectFlows);
    const programEmitter = useRef(new ProgramEmitter());
    const layers = useAppSelector(selectLayers);

    // useEffect(() => {
    //     programEmitter.current.updateAssets()
    // }, [ assets ]);

    useEffect(() => {
        const topFlowsPerLayer = objMap(layers, l => l.topFlowId);
        const projectContext = validateProject(flows, baseEnvironment, topFlowsPerLayer);
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

export default ProgramsManager;