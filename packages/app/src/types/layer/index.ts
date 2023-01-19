import { IDependency } from "../dependencyGraph";

export interface Layer extends IDependency {
    name: string;
    rootGeometryId: string;
}