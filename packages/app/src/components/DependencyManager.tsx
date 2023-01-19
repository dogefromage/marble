import { useEffect } from 'react';
import { useAppSelector } from '../redux/hooks';
import { selectDependencyGraph } from '../slices/dependencyGraphSlice';
import { selectGeometries } from '../slices/geometriesSlice';
import { selectLayers } from '../slices/layersSlice';
import { selectTemplates } from '../slices/templatesSlice';
import { DependencyNodeType, GeometryS, GNodeT, GNodeTemplateTypes, Layer } from '../types';
import { useRegisterDependency } from '../utils/dependencyGraph/useRegisterDependency';
import getDependencyKey from '../utils/graph/getDependencyKey';

function getLayerDeps(layer: Layer) {
    return [ getDependencyKey(layer.rootGeometryId, DependencyNodeType.Geometry) ];
}

function getGeometryDeps(geo: GeometryS) {
    const templateDependencies = new Set<string>();
    for (const node of geo.nodes) {
        templateDependencies.add(node.templateId);
    }
    return [ ...templateDependencies ].map(id => getDependencyKey(id, DependencyNodeType.NodeTemplate));
}

function getTemplateDeps(temp: GNodeT) {
    const dep = getDependencyKey(temp.id, DependencyNodeType.Geometry);
    return temp.type === GNodeTemplateTypes.Composite ? [ dep ] : [];
}

const DependencyManager = () =>
{
    // layers
    useRegisterDependency(
        useAppSelector(selectLayers),
        getLayerDeps,
        DependencyNodeType.Layer,
    );
    // geometries
    useRegisterDependency(
        useAppSelector(selectGeometries),
        getGeometryDeps,
        DependencyNodeType.Geometry,
    );
    // templates
    useRegisterDependency(
        useAppSelector(selectTemplates).templates,
        getTemplateDeps,
        DependencyNodeType.NodeTemplate,
    );

    // // PRINT
    // const dependencyGraph = useAppSelector(selectDependencyGraph);
    // useEffect(() => {
    //     console.log(dependencyGraph);
    // }, [ dependencyGraph ]);

    return null;
}

export default DependencyManager;