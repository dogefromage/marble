import { useAppSelector } from '../redux/hooks';
import { selectGeometries } from '../slices/geometriesSlice';
import { selectLayers } from '../slices/layersSlice';
import { selectTemplates } from '../slices/templatesSlice';
import { decomposeTemplateId, DependencyNodeType, GeometryS, getDependencyKey, GNodeTemplate, GNodeTemplateTypes, Layer } from '../types';
import { useRegisterDependency } from '../utils/dependencyGraph/useRegisterDependency';

function getLayerDeps(layer: Layer) {
    return [ getDependencyKey(layer.rootGeometryId, 'geometry') ];
}

function getGeometryDeps(geo: GeometryS) {
    const templateDependencies = new Set<string>();
    for (const node of geo.nodes) {
        templateDependencies.add(node.templateId);
    }
    return [ ...templateDependencies ].map(id => getDependencyKey(id, 'node_template'));
}

function getTemplateDeps(temp: GNodeTemplate) {
    const dep = getDependencyKey(temp.id, 'geometry');
    const { templateType } = decomposeTemplateId(temp.id);
    return templateType === 'composite' ? [ dep ] : [];
}

const DependencyManager = () =>
{
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

    // // PRINT
    // const dependencyGraph = useAppSelector(selectDependencyGraph);
    // useEffect(() => {
    //     console.info(dependencyGraph);
    // }, [ dependencyGraph ]);

    return null;
}

export default DependencyManager;