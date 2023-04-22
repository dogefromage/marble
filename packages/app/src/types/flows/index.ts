import { AnonymousFlowSignature, EnvironmentContent, FlowSignature, TypeSpecifier } from "@marble/language";
import internalTemplates from '../../glsl/test.template.glsl';
import { Obj } from "../UtilityTypes";

const vec3 = { type: 'reference', name: 'vec3' } satisfies TypeSpecifier;
const number = { type: 'primitive', primitive: 'number' } satisfies TypeSpecifier;

const specifierDefinitions: Obj<TypeSpecifier> = { 
    vec3: { type: 'map', elements: { x: number, y: number, z: number } }, 
};

export const topFlowSignature: AnonymousFlowSignature = {
    inputs: [{
        id: 'p',
        label: 'Position',
        rowType: 'input-simple',
        dataType: vec3,
    }],
    outputs: [{
        id: 'd',
        label: 'Distance',
        rowType: 'output',
        dataType: number,
    }],
}

const signatures: Obj<FlowSignature> = {};
export const buildinFunctionBlocks: Obj<string> = {};

for (const template of internalTemplates) {
    if (template.type === 'signature') {
        signatures[template.signature.id] = template.signature;
        buildinFunctionBlocks[template.signature.id] = template.glsl;
    }
}

export const baseEnvironment: EnvironmentContent = {
    types: specifierDefinitions,
    signatures,
};