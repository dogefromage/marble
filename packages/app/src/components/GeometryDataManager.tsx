import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../redux/hooks';
import { selectDependencyGraph } from '../slices/dependencyGraphSlice';
import { geometriesUpdateExpiredProps, selectGeometries } from '../slices/flowsSlice';
import { geometryDatasSetMany, selectGeometryDatas } from '../slices/geometryDatasSlice';
import { selectTemplates } from '../slices/templatesSlice';
import { GeometryConnectionData, GeometryS, getDependencyKey } from '../types';
import generateGeometryData from '../utils/geometries/generateGeometryData';

const GeometryDataManager = () =>{
    const dispatch = useAppDispatch();
    const geometryDatas = useAppSelector(selectGeometryDatas);
    const geometries = useAppSelector(selectGeometries);
    const { templates } = useAppSelector(selectTemplates);
    const dependencyManager = useAppSelector(selectDependencyGraph);

    useEffect(() => {
        
        const setDatas: GeometryConnectionData[] = [];
        const expiredProps: { geometryId: string, geometryVersion: number, expiredProps: GeometryConnectionData['expiredProps'] }[] = [];

        const lastKeys = new Set(Object.keys(geometryDatas));

        for (const geometry of Object.values(geometries) as GeometryS[]) {
            lastKeys.delete(geometry.id);
            // get hash from dependency graph
            const graphKey = getDependencyKey(geometry.id, 'geometry');
            const graphOrder = dependencyManager.order.get(graphKey);
            if (!graphOrder) continue;
            // if (graphOrder?.state === 'met') {
                // compare to last entry using hash
                const last = geometryDatas[geometry.id];
                if (last == null || last.hash != graphOrder.hash) {
                    // create new geometry data if expired
                    const newData = generateGeometryData(geometry, templates, graphOrder.hash);
                    if (newData.expiredProps.needsUpdate) {
                        expiredProps.push({
                            geometryId: geometry.id,
                            geometryVersion: geometry.version,
                            expiredProps: newData.expiredProps
                        });
                    } else {
                        // only set if clean
                        setDatas.push(newData);
                    }
                }
            // }
        }

        // if key from last time wasn't in geometries, remove
        const removeDatas = new Array(...lastKeys);

        if (expiredProps.length > 0) {
            dispatch(geometriesUpdateExpiredProps({
                geometries: expiredProps,
            }));
        }
        if (setDatas.length + removeDatas.length > 0) {
            dispatch(geometryDatasSetMany({
                removeDatas, setDatas,
            }));
        }
    }, [ dispatch, dependencyManager ]);

    return null;
}

export default GeometryDataManager;