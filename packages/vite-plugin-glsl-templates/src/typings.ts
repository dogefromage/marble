import { FlowSignature } from "@marble/language";

interface SignatureTemplate {
    type: 'signature';
    signature: FlowSignature;
    glsl: string;
}

export type SourceTemplate =
    | SignatureTemplate