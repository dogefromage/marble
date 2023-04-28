import * as ml from "@marble/language";
import internalTemplates from '../../glsl/test.template.glsl';
import { Obj } from "../UtilityTypes";

const vec3Ref = ml.types.createReference('vec3');
const numberPrimitive = ml.types.createPrimitive('number');

const DISTANCE_STRUCT_NAME = 'Distance';
const distanceRef = ml.types.createReference(DISTANCE_STRUCT_NAME);

export const topFlowSignature: ml.AnonymousFlowSignature = {
    inputs: [{
        id: 'p',
        label: 'Position',
        rowType: 'input-simple',
        dataType: vec3Ref,
    }],
    outputs: [{
        id: 'd',
        label: 'Distance',
        rowType: 'output',
        dataType: distanceRef,
    }],
}

// import from loader
export const internalNodeSignatures: Obj<ml.FlowSignature> = {};
export const internalNodeFunctions: Obj<string> = {};
for (const template of internalTemplates) {
    if (template.type === 'signature') {
        internalNodeSignatures[template.signature.id] = template.signature;
        internalNodeFunctions[template.signature.id] = template.glsl;
    }
}



export const initialEnvironment: ml.FlowEnvironmentContent = {
    types: {
        vec3: ml.types.createMap({
            x: numberPrimitive,
            y: numberPrimitive,
            z: numberPrimitive,
        }),
        [DISTANCE_STRUCT_NAME]: ml.types.createMap({
            radius: numberPrimitive,
            color: vec3Ref,
        }),
    },
    signatures: internalNodeSignatures,
};