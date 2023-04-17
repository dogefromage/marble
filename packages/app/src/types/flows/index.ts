import { AnonymousFlowSignature } from "@marble/language";

export const topFlowSignature: AnonymousFlowSignature = {
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