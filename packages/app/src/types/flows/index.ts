import { AnonymousFlowSignature, FlowEnvironmentContent, FlowSignature, TypeSpecifier } from "@marble/language";
import internalTemplates from '../../glsl/test.template.glsl';
import { Obj } from "../UtilityTypes";

const vec3Reference = { type: 'reference', name: 'vec3' } satisfies TypeSpecifier;
const numberPrimitive = { type: 'primitive', primitive: 'number' } satisfies TypeSpecifier;

export const topFlowSignature: AnonymousFlowSignature = {
    inputs: [{
        id: 'p',
        label: 'Position',
        rowType: 'input-simple',
        dataType: vec3Reference,
    }],
    outputs: [{
        id: 'd',
        label: 'Distance',
        rowType: 'output',
        dataType: numberPrimitive,
    }],
}

// import from loader
export const internalNodeSignatures: Obj<FlowSignature> = {};
export const internalNodeFunctions: Obj<string> = {};
for (const template of internalTemplates) {
    if (template.type === 'signature') {
        internalNodeSignatures[template.signature.id] = template.signature;
        internalNodeFunctions[template.signature.id] = template.glsl;
    }
}



export const initialEnvironment: FlowEnvironmentContent = {
    types: {
        vec3: {
            type: 'map',
            elements: { x: numberPrimitive, y: numberPrimitive, z: numberPrimitive }
        },
    },
    signatures: internalNodeSignatures,
};