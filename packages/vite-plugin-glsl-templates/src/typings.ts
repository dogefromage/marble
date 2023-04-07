import { FunctionSignature } from "@marble/language";

interface SignatureTemplate {
    type: 'signature';
    signature: FunctionSignature;
    glsl: string;
}

export type SourceTemplate =
    | SignatureTemplate