import React, { useEffect, useRef } from 'react';
import { useAppDispatch, useAppSelector } from '../redux/hooks';
import { selectFlows } from '../slices/flowsSlice';
import { validateProject } from '@marble/language';
import { selectAssets } from '../slices/assetsSlice';
import { validationSetResult } from '../slices/contextSlice';
import { EnvironmentContent } from '@marble/language';
import { ProgramEmitter } from '../utils/layerPrograms/ProgramEmitter';
import { selectLayers } from '../slices/layersSlice';

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

        const programs = programEmitter.current
            .emitPrograms(layers, flows, projectContext);

    }, [ layers, flows, assets.signatures ]);

    return null;
}

export default ProgramsManager;