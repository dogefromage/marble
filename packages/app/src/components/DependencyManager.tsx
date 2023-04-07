import { useEffect } from 'react';
import { useAppSelector } from '../redux/hooks';
import { selectDependencyGraph } from '../slices/dependencyGraphSlice';
import { selectGeometries } from '../slices/flowsSlice';
import { selectLayers } from '../slices/layersSlice';
import { selectTemplates } from '../slices/templatesSlice';
import { decomposeTemplateId, DependencyNodeKey, GeometryS, getDependencyKey, GNodeTemplate, Layer } from '../types';
import { useRegisterDependency } from '../utils/dependencyGraph/useRegisterDependency';

function getLayerDeps(layer: Layer) {
    return [ getDependencyKey(layer.rootGeometryId, 'geometry') ];
}

function getGeometryDeps(geo: GeometryS) {
    const templateDependencies = new Set<DependencyNodeKey>();
    for (const node of geo.nodes) {
        const { id, type } = decomposeTemplateId(node.templateId);
        if (type === 'composite') {
            templateDependencies.add(getDependencyKey(node.templateId, 'node_template'));
        }
    }
    return [ ...templateDependencies ];
}

function getTemplateDeps(temp: GNodeTemplate) {
    const { id, type: templateType } = decomposeTemplateId(temp.id);
    if (templateType != 'composite') {
        return [];
    }
    const deps = [ getDependencyKey(id, 'geometry') ];
    return deps;
}

const DependencyManager = () => {
    // layers
    useRegisterDependency(
        useAppSelector(selectLayers),
        getLayerDeps,
        'layer',
    );
    // geometries
    useRegisterDependency(
        useAppSelector(selectGeometries),
        getGeometryDeps,
        'geometry',
    );
    // templates
    useRegisterDependency(
        useAppSelector(selectTemplates).templates,
        getTemplateDeps,
        'node_template',
    );

    // // // PRINT
    // const dependencyGraph = useAppSelector(selectDependencyGraph);
    // useEffect(() => {
    //     console.info(dependencyGraph);
    // }, [ dependencyGraph ]);

    return null;
}

export default DependencyManager;