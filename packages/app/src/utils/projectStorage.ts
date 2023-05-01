import { jsonReplacer, jsonReviver } from "./serialization";

export const PROJECT_KEY = 'project';

export function loadLocalProject() {
    const stored = localStorage.getItem(PROJECT_KEY);
    if (stored != null) {
        try {
            return JSON.parse(stored, jsonReviver);
        } catch (e) {
            console.error(e);
        }
    }
}

export function storeLocalProject(data: any) {
    try {
        const stateJSON = JSON.stringify(data, jsonReplacer);
        storeLocalProjectJson(stateJSON);
    } catch (e) {
        console.error(e);
    }
}

export function storeLocalProjectJson(json: string | null) {
    if (json) {
        localStorage.setItem(PROJECT_KEY, json);
    } else {
        localStorage.removeItem(PROJECT_KEY);
    }
}