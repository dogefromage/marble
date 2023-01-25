import produce, { castDraft } from "immer";
import { useEffect, useState } from "react";
import { ObjMapUndef } from "../types";

type IDObj = { id: string };

export function detectMapDifference<X extends IDObj, Y extends IDObj>(options: {
    reference: ObjMapUndef<X>,
    lastImage: ObjMapUndef<Y>,
    map: (input: X) => Y | null,
    hasChanged: (reference: X, image: Y) => boolean,
}) {
    const { reference, lastImage, map, hasChanged } = options;

    const setItems: Y[] = [];
    const removeItems: Y[] = [];

    const lastKeys = new Set(Object.keys(lastImage));
    for (const x of Object.values(reference) as X[]) {
        lastKeys.delete(x.id);
        const lastY = lastImage[x.id];
        if (lastY == null || hasChanged(x, lastY)) {
            const newY = map(x);
            if (newY != null) {
                setItems.push(newY);
            }
        }
    }
    for (const key of lastKeys) {
        removeItems.push(lastImage[key]!);
    }
    return { removeItems, setItems };
}

/**
 * Reacts on changes of property reference.
 */
export default function <X extends IDObj, Y extends IDObj>(options: {
    reference: ObjMapUndef<X>,
    map: (input: X) => Y,
    hasChanged: (reference: X, image: Y) => boolean,
    onDestroy?: (item: Y) => void,
}) {
    const { reference, map, hasChanged, onDestroy } = options;
    const [ image, setImage ] = useState<ObjMapUndef<Y>>({});

    useEffect(() => {
        const { setItems, removeItems } = detectMapDifference<X, Y>({
            reference, lastImage: image, map, hasChanged,
        });

        if (removeItems.length + setImage.length > 0) {
            // call onDestroy on all to be garbage collected items
            const destroyIds = new Set([
                ...removeItems.map(item => item.id),
                ...setItems.map(item => item.id)
            ]);
            for (const id of destroyIds) {
                const item = image[id]!;
                if (item != null) {
                    onDestroy?.(item);
                }
            }
            // update state
            setImage(produce(lastImage => {
                for (const item of removeItems) {
                    delete lastImage[item.id];
                }
                for (const item of setItems) {
                    lastImage[item.id] = castDraft(item);
                }
            }));
        }
    }, [ reference ]);

    return image;
}
