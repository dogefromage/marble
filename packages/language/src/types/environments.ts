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

export class FlowEnvironment {
    private parent: FlowEnvironment | null = null;

    constructor(
        private content: EnvironmentContent
    ) {}

    public push(content: EnvironmentContent): FlowEnvironment {
        const next = new FlowEnvironment(content);
        next.parent = this; 
        return next;
    }
    public pop(expectedCurrent: EnvironmentContent): FlowEnvironment {
        if (expectedCurrent && this.content !== expectedCurrent) {
            throw new Error(`Not expected`);
        }
        if (!this.parent) {
            throw new Error(`Top scope cannot be popped`);
        }
        return this.parent;
    }

    public getSignature(signatureId: FlowSignatureId): FlowSignature | undefined {
        const possibleEntry = this.content.signatures[signatureId];
        if (possibleEntry != null) {
            return possibleEntry;
        }
        return this.parent?.getSignature(signatureId);
    }
    public getType(name: string): TypeSpecifier | undefined {
        const possibleEntry = this.content.types[name];
        if (possibleEntry != null) {
            return possibleEntry;
        }
        return this.parent?.getType(name);
    }

    public getAvailableSignatures(): Obj<FlowSignature> {
        return {
            ...(this.parent?.getAvailableSignatures() || {}),
            ...this.content.signatures,
        }
    }
}