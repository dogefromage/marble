import { useMemo } from "react";
import { useAppSelector } from "../../redux/hooks";
import { selectDependencyGraph } from "../../slices/dependencyGraphSlice";
import { DependencyNodeType } from "../../types";
import getDependencyKey from "./getDependencyKey";

export default function (id: string, type: DependencyNodeType) {

    const key = getDependencyKey(id, type);
    const dependencies = useAppSelector(selectDependencyGraph);

    return useMemo(() => {
        const orderEl = dependencies.order.get(key);
        if (orderEl?.state !== 'met') {
            return;
        }
        return orderEl.hash;
    }, [ key, dependencies ]);
}