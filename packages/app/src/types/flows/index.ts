import { AnonymousFunctionSignature, AtomicTypeSpecifier } from "@marble/language";

function atom(atom: string): AtomicTypeSpecifier {
    return { type: 'atomic', atom };
}

export const topFlowSignature: AnonymousFunctionSignature = {
    inputs: [{
        id: 'p',
        label: 'Position',
        rowType: 'input-simple',
        dataType: atom('vec3'),
    }],
    outputs: [{
        id: 'd',
        label: 'Distance',
        rowType: 'output',
        dataType: atom('float'),
    }],
}