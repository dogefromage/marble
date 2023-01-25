import { DependencyNodeType } from "../../types";

export function getDependencyKey(id: string, type: DependencyNodeType) {
    return `${type}:${id}`;
}

export function splitDependencyKey(key: string) {
    const [ type, id ] = key.split(':') as [ DependencyNodeType, string ];
    return { type, id }
}