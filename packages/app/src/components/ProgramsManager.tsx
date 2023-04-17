import { EnvironmentContent, validateProject } from '@marble/language';
import { useEffect, useRef } from 'react';
import { useAppDispatch, useAppSelector } from '../redux/hooks';
import { selectAssets } from '../slices/assetsSlice';
import { validationSetResult } from '../slices/contextSlice';
import { selectFlows } from '../slices/flowsSlice';
import { selectLayers } from '../slices/layersSlice';
import { ProgramEmitter } from '../utils/layerPrograms/ProgramEmitter';

interface Props {

}

const ProgramsManager = ({}: Props) => {
    const dispatch = useAppDispatch();
    const flows = useAppSelector(selectFlows);
    const assets = useAppSelector(selectAssets);
    const programEmitter = useRef(new ProgramEmitter());
    const layers = useAppSelector(selectLayers);

    // useEffect(() => {
    //     programEmitter.current.updateAssets()
    // }, [ assets ]);

    useEffect(() => {
        const baseContent: EnvironmentContent = {
            signatures: assets.signatures,
            types: assets.types,
        };
        const projectContext = validateProject(flows, baseContent);
        dispatch(validationSetResult({
            context: projectContext,
        }));

        // const programs = programEmitter.current
        //     .emitPrograms(projectContext, layers);

    }, [ layers, flows, assets.signatures ]);

    return null;
}

export default ProgramsManager;