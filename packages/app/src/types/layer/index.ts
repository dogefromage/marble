import { IDependency } from "../dependencyGraph";

export interface Layer extends IDependency {
    name: string;
    index: number;
    rootGeometryId: string;
}