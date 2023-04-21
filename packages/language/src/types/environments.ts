import { FlowSignature, FlowSignatureId } from "./signatures";
import { TypeSpecifier } from "./typeSpecifiers";
import { Obj } from "./utils";

export interface EnvironmentContent {
    signatures: Obj<FlowSignature>;
    types: Obj<TypeSpecifier>;
}

/**
 * A suitable environment (or interpretation) for a given flow graph to make sense.
 * Should be provided for interpretation, display etc.
 */
export interface FlowEnvironment {
    getSignature(signatureId: FlowSignatureId): FlowSignature | undefined;
    getType(name: string): TypeSpecifier | undefined;
    getTotalContent(): EnvironmentContent;
}
