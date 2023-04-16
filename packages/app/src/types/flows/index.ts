import { AnonymousFunctionSignature } from "@marble/language";

export const topFlowSignature: AnonymousFunctionSignature = {
    inputs: [{
        id: 'p',
        label: 'Position',
        rowType: 'input-simple',
        dataType: { type: 'reference', name: 'vec3' },
    }],
    outputs: [{
        id: 'd',
        label: 'Distance',
        rowType: 'output',
        dataType: { type: 'primitive', primitive: 'float' },
    }],
}