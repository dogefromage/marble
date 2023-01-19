import { useEffect, useRef } from 'react';
import { useAppDispatch, useAppSelector } from '../redux/hooks';
import { selectDependencyGraph } from '../slices/dependencyGraphSlice';
import { selectGeometries } from '../slices/geometriesSlice';
import { selectGeometryDatas } from '../slices/geometryDatasSlice';
import { selectLayers } from '../slices/layersSlice';
import { programsSetMany, selectPrograms } from '../slices/programsSlice';
import { selectTemplates } from '../slices/templatesSlice';
import { DependencyNodeType, Layer, LayerProgram } from '../types';
import assertErrorType from '../utils/assertErrorType';
import getDependencyKey from '../utils/graph/getDependencyKey';
import { GeometryCompilationException } from '../utils/program/GeometryCompilationException';
import ProgramCompiler from '../utils/program/ProgramCompiler';

const CompilerRoot = () =>
{
    const compilerRef = useRef(new ProgramCompiler());
    
    const dispatch = useAppDispatch();
    const { includes } = useAppSelector(selectTemplates);
    const geometries = useAppSelector(selectGeometries);    
    const geometryDatas = useAppSelector(selectGeometryDatas);
    const layers = useAppSelector(selectLayers);
    const dependencyGraph = useAppSelector(selectDependencyGraph);
    const programs = useAppSelector(selectPrograms);

    useEffect(() => {
        const compiler = compilerRef.current;

        const setPrograms: LayerProgram[] = [];
        const lastKeys = new Set(Object.keys(programs));

        for (const layer of Object.values(layers) as Layer[]) {
            lastKeys.delete(layer.id);
            // get hash from dependency graph
            const layerKey = getDependencyKey(layer.id, DependencyNodeType.Layer);
            const layerOrder = dependencyGraph.order.get(layerKey);
            if (layerOrder?.state === 'met') {
                // compare to last entry using hash
                const last = programs[layer.id];
                if (last == null || last.hash != layerOrder.hash) {
                    // compile new program if expired
                    try {
                        const newProgram = compiler.compileProgram({ 
                            layer, geometries, geometryDatas, dependencyGraph, includes 
                        });
                        setPrograms.push(newProgram);
                    }
                    catch (e: any) {
                        if (assertErrorType(e, GeometryCompilationException)) {
                            // console.warn(e.message);
                            return;
                        }
                        throw e;
                    }
                }
            }
        }

        // if key from last time wasn't in programs, remove
        const removePrograms = new Array(...lastKeys);
        if (setPrograms.length + setPrograms.length > 0) {
            dispatch(programsSetMany({
                removePrograms, setPrograms,
            }));
        }
    }, [ dispatch, dependencyGraph, geometryDatas ]);


    // const geometry: GeometryS | undefined = Object.values(geometries)?.[0];
    // const connectionData = useMemo(() => 
    // {
    //     if (!geometry || !templates || !Object.values(templates).length) return;
    //     return generateGeometryConnectionData(geometry, templates);
    // }, [ geometry?.id, geometry?.compilationValidity, templates ]);
    
    // useEffect(() =>
    // {
    //     if (!connectionData || !geometry) return;

    //     try
    //     {
    //         const textureCoordCounter = new Counter(LOOKUP_TEXTURE_SIZE * LOOKUP_TEXTURE_SIZE);
    //         const geometryMethodCode = compileGeometry(geometry, connectionData, textureCoordCounter);

    //         const usedIncludes: ProgramInclude[] = [];
    //         geometryMethodCode.includedTokens.forEach(includeToken => 
    //         {
    //             const include = programIncludes[includeToken];
    //             if (!include) return console.error(`Include missing "${includeToken}"`);
    //             usedIncludes.push(include);
    //         })

    //         const program: SceneProgram = 
    //         {
    //             rootMethod: geometryMethodCode,
    //             includes: usedIncludes,
    //         }
            
    //         dispatch(sceneProgramSetProgram({
    //             program,
    //         }));
    //     }
    //     catch (e: any)
    //     {
    //         if (e instanceof GeometriesCompilationError)
    //         {
    //             dispatch(consoleAppendMessage({
    //                 text: `Geometry ${geometry.id} could not be compiled: ${e.message}`,
    //                 type: `warning`,
    //             }));
    //         } else {
    //             throw e;
    //         }
    //     }

    // }, [ 
    //     geometry?.id,
    //     connectionData,
    // ]);

    // useEffect(() =>
    // {
    //     if (!program || !geometry || !connectionData)
    //         return;

    //     if (program.rootMethod.geometryId !== geometry.id ||
    //         connectionData.geometryId !== geometry.id)
    //         return;
        
    //     if (program.rootMethod.compilationValidity !== geometry.compilationValidity ||
    //         connectionData.compilationValidity !== geometry.compilationValidity)
    //         return;

    //     for (const mapping of Object.values(program.rootMethod.textureVarMappings))
    //     {
    //         const nodeState = geometry.nodes[mapping.nodeIndex];
    //         const template = connectionData.templateMap.get(nodeState.id)!;
    //         const rowT = template.rows[mapping.rowIndex];
    //         const rowS = nodeState.rows[rowT.id];

    //         const rowValue: number | number[] = (rowS as any).value ?? (rowT as any).value;

    //         let subArray: number[];
            
    //         if (mapping.dataTypes === DataTypes.Vec2 ||
    //             mapping.dataTypes === DataTypes.Vec3 ||
    //             mapping.dataTypes === DataTypes.Mat3)
    //         {
    //             subArray = rowValue as number[];
    //             const size = TEXTURE_VAR_DATATYPE_SIZE[mapping.dataTypes];
    //             if (!Array.isArray(subArray) || !(subArray.length === size)) continue;
    //         }
    //         else if (mapping.dataTypes === DataTypes.Float)
    //         {
    //             subArray = [ rowValue as number ];
    //         }
    //         else
    //         {
    //             console.error(`Unknown datatype`);
    //             continue;
    //         }

    //         dispatch(sceneProgramSetLookupSubarray({
    //             startCoordinate: mapping.textureCoordinate,
    //             subArray,
    //         }));
    //     }
    // }, [ 
    //     geometry?.id,
    //     geometry?.rowStateValidity,
    //     program,
    //     connectionData,
    // ]);

    return null;
}

export default CompilerRoot;