import { AnonymousFlowSignature, EnvironmentContent, FlowSignature, MapTypeSpecifier, TypeSpecifier } from "@marble/language";
import internalTemplates from '../../glsl/test.template.glsl';
import { Obj } from "../UtilityTypes";

const float: TypeSpecifier = { type: 'primitive', primitive: 'float' };
const vec3: MapTypeSpecifier = { type: 'map', elements: { x: float, y: float, z: float } };

export const glslPrimitives = { vec3, float };

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
        dataType: float,
    }],
}


const signatures: Obj<FlowSignature> = {};
for (const template of internalTemplates) {
    signatures[template.signature.id] = template.signature;
}

export const baseEnvironment: EnvironmentContent = {
    types: glslPrimitives,
    signatures,
};