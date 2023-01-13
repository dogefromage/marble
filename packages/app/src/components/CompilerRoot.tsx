import { useEffect, useRef } from 'react';
import { useAppDispatch, useAppSelector } from '../redux/hooks';
import { consoleAppendMessage } from '../slices/consoleSlice';
import { selectGeometries } from '../slices/geometriesSlice';
import { selectTemplates } from '../slices/templatesSlice';
import ProgramCompiler from '../utils/program/ProgramCompiler';

const CompilerRoot = () =>
{
    const dispatch = useAppDispatch();
    const compilerRef = useRef(new ProgramCompiler());
    // const { program } = useAppSelector(selectSceneProgram);

    const { templates, includes: programIncludes } = useAppSelector(selectTemplates);

    useEffect(() => {
        compilerRef.current.setTemplates(templates);
        compilerRef.current.setIncludes(programIncludes);
    }, [ templates, programIncludes ]);

    const geometries = useAppSelector(selectGeometries);    
    useEffect(() => {
        const compiler = compilerRef.current;

        // compiler.updateGeometries(geometries);
        // const newLayerPrograms = compiler.generateNewLayerPrograms();

        try {
            const compiledProgram = compiler.compileRenderLayer(geometries);
        } 
        catch (e: any) { 
            const errorInfos = compiler.getErrorInfos();
            dispatch(consoleAppendMessage({
                text: e.message,
                type: 'error',
            }));
        }
    }, [ geometries ]);


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