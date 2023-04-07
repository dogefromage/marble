import { FunctionSignature } from "./signatures";

/**
 * A suitable environment (or interpretation) for a given flow graph to make sense.
 * Should be provided for interpretation, display etc.
 */
export interface GraphEnvironment {
    functions: Map<string, FunctionSignature>;
    // types: Map<string, TypeSpecifier>;
}