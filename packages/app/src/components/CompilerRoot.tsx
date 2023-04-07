import { useEffect, useRef } from 'react';
import { detectMapDifference } from '../hooks/useReactiveMap';
import { useAppDispatch, useAppSelector } from '../redux/hooks';
import { selectDependencyGraph } from '../slices/dependencyGraphSlice';
import { layerProgramsSetMany, layerProgramsSetRows, selectLayerPrograms } from '../slices/layerProgramsSlice';
import { selectLayers } from '../slices/layersSlice';
import { selectTemplates } from '../slices/templatesSlice';
import { getDependencyKey, Layer, LayerProgram, Obj } from '../types';
import { mapDynamicValues } from '../utils/layerPrograms';
import ProgramCompiler from '../utils/layerPrograms/ProgramCompiler';

const CompilerRoot = () => {
    const compilerRef = useRef(new ProgramCompiler());
    
    const dispatch = useAppDispatch();
    const { includes } = useAppSelector(selectTemplates);
    const geometries = useAppSelector(selectGeometries);    
    const geometryDatas = useAppSelector(selectGeometryDatas);
    const layers = useAppSelector(selectLayers);
    const dependencyGraph = useAppSelector(selectDependencyGraph);
    const layerPrograms = useAppSelector(selectLayerPrograms);

    useEffect(() => {
        const compiler = compilerRef.current;

        const { setItems, removeItems } = detectMapDifference<Layer, LayerProgram>({
            reference: layers,
            lastImage: layerPrograms,
            map: (layer) => {
                try {
                    console.time("COMPILATION");
                    const program = compiler.compileProgram({ 
                        layer, geometries, includes,
                        geometryDatas, dependencyGraph,  
                        textureVarRowIndex: layer.index,
                    });
                    console.timeEnd("COMPILATION");
                    return program;
                } catch (e: any) {
                    console.error(e);
                }
                return null;
            },
            hasChanged: (layer, program) => {
                const layerKey = getDependencyKey(layer.id, 'layer');
                const layerOrder = dependencyGraph.order.get(layerKey);
                if (!layerOrder) return false;
                return layerOrder.hash !== program.hash;
            }
        });

        if (setItems.length + removeItems.length > 0) {
            dispatch(layerProgramsSetMany({
                removePrograms: removeItems.map(item => item.id), 
                setPrograms: setItems,
            }));
        }
    }, [ dispatch, dependencyGraph, geometryDatas, ]); // geometryDatas are generated after depGraph changed

    useEffect(() => {
        const setRows: Obj<number[]> = {};
        for (const program of Object.values(layerPrograms) as LayerProgram[]) {
            const newRow = mapDynamicValues(program.textureVarMappings, geometries, geometryDatas, program.textureVarRow);
            if (newRow != program.textureVarRow) {
                setRows[program.id] = newRow;
            }
        }
        if (Object.keys(setRows).length > 0) {
            dispatch(layerProgramsSetRows({
                rowMap: setRows,
            }));
        }
    }, [ geometries, geometryDatas ]);

    return null;
}

export default CompilerRoot;