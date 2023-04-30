import * as ml from "@marble/language";
import { Obj } from "../UtilityTypes";
import solidOpTemplates from '../../glsl/solid_ops.template.glsl';
import solidTemplates from '../../glsl/solids.template.glsl';
import testingTemplates from '../../glsl/testing.template.glsl';
import vectorTemplates from '../../glsl/vectors.template.glsl';
import spaceTemplates from '../../glsl/space.template.glsl';

const vec3Ref = ml.types.createReference('vec3');
// const vec2Ref = ml.types.createReference('vec2');
// const mat3Ref = ml.types.createReference('mat3');
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

const internalTemplates = [
    ...solidTemplates,
    ...solidOpTemplates,
    ...vectorTemplates,
    ...testingTemplates,
    ...spaceTemplates,
];

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
        vec2: ml.types.createMap({
            x: numberPrimitive,
            y: numberPrimitive,
        }),
        mat3: ml.types.createMap({
            column_1: vec3Ref,
            column_2: vec3Ref,
            column_3: vec3Ref,
        }),
        [DISTANCE_STRUCT_NAME]: ml.types.createMap({
            radius: numberPrimitive,
            color: vec3Ref,
        }),
    },
    signatures: internalNodeSignatures,
};