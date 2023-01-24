import { useCallback, useEffect, useState } from "react";
import { ObjMapUndef } from "../types";

type IDObj = { id: string };

export default function <T extends IDObj, E extends IDObj>(
    reference: ObjMapUndef<T>,
    options: {
        map: (input: T) => E,
        isEqual?: (a: E, b: E) => boolean,
    }
) {
    const [ image, setImage ] = useState<ObjMapUndef<E>>({});

    const addItems = useCallback((images: E[]) => {
        const newObj = Object.fromEntries(images.map(image => [ image.id, image ]));
        setImage(last => ({ ...last, ...newObj }));
    }, [ setImage ]);

    const removeItems = useCallback((images: E[]) => {

    }, []);
    
    useDetectDifference(reference, image, {
        ...options,
        addItems,
        removeItems,
    })
}

export function useDetectDifference<T extends IDObj, E extends IDObj>(
    reference: ObjMapUndef<T>,
    target: ObjMapUndef<E>,
    options: {
        map: (input: T) => E,
        isEqual?: (a: E, b: E) => boolean,
        addItems?: (images: E[]) => void,
        removeItems?: (images: E[]) => void,
    }
) {
    useEffect(() => {
        const setDatas: GeometryConnectionData[] = [];
        const expiredProps: { geometryId: string, geometryVersion: number, expiredProps: GeometryConnectionData['expiredProps'] }[] = [];

        const lastKeys = new Set(Object.keys(geometryDatas));

        for (const geometry of Object.values(geometries) as GeometryS[]) {
            lastKeys.delete(geometry.id);
            // get hash from dependency graph
            const graphKey = getDependencyKey(geometry.id, DependencyNodeType.Geometry);
            const graphOrder = dependencyManager.order.get(graphKey);
            if (graphOrder?.state === 'met') {
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
            }
        }

        // if key from last time wasn't in geometries, remove
        const removeDatas = new Array(...lastKeys);

        if (expiredProps.length > 0) {
            dispatch(geometriesUpdateExpiredProps({
                geometries: expiredProps,
            }))
        }
        if (setDatas.length + removeDatas.length > 0) {
            dispatch(geometryDatasSetMany({
                removeDatas, setDatas,
            }));
        }
    }, [ dispatch, dependencyManager ]);
}