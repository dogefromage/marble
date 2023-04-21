import { validateProject } from '@marble/language';
import { useEffect, useRef } from 'react';
import { useAppDispatch, useAppSelector } from '../redux/hooks';
import { validationSetResult } from '../slices/contextSlice';
import { selectFlows } from '../slices/flowsSlice';
import { selectLayers } from '../slices/layersSlice';
import { baseEnvironment } from '../types/flows';
import { ProgramEmitter } from '../utils/layerPrograms/ProgramEmitter';

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
        const projectContext = validateProject(flows, baseEnvironment);
        dispatch(validationSetResult({
            context: projectContext,
        }));

        // const programs = programEmitter.current
        //     .emitPrograms(projectContext, layers);

    }, [ layers, flows ]);

    return null;
}

export default ProgramsManager;