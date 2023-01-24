import { useRef, useEffect } from "react";
import { useAppDispatch } from "../../redux/hooks";
import { dependencyGraphUpdateGraph } from "../../slices/dependencyGraphSlice";
import { IDependency, ObjMapUndef, DependencyNodeType, DependencyGraphNode } from "../../types";
import getDependencyKey from "../graph/getDependencyKey";

export function useRegisterDependency<T extends IDependency>(
    elements: ObjMapUndef<T>,
    getDependenciesOfElement: (element: T) => string[],
    dependencyType: DependencyNodeType,
) {
    const dispatch = useAppDispatch();
    const lastElements = useRef(new Map<string, T>());

    useEffect(() => {
        const addNodes: DependencyGraphNode[] = [];
        const removeNodes: string[] = [];

        const newElements = new Map<string, T>();

        for (const element of Object.values(elements) as T[]) {
            newElements.set(element.id, element);
            
            const lastElement = lastElements.current.get(element.id);
            lastElements.current.delete(element.id);

            if (lastElement != null && lastElement.version == element.version) {
                continue;
            }

            if (lastElement != null) {
                removeNodes.push(getDependencyKey(element.id, dependencyType));
            }

            // generate node
            const depsOfElement = getDependenciesOfElement(element);
            addNodes.push({
                key: getDependencyKey(element.id, dependencyType),
                type: dependencyType,
                version: element.version,
                dependencies: depsOfElement,
            });
        }

        for (const [ id, _ ] of lastElements.current) {
            removeNodes.push(getDependencyKey(id, dependencyType));
        }

        lastElements.current = newElements;

        if (addNodes.length > 0 || removeNodes.length > 0) {
            dispatch(dependencyGraphUpdateGraph({
                addNodes,
                removeNodes,
            }));
        }
    }, [ elements, getDependenciesOfElement ]);
}
