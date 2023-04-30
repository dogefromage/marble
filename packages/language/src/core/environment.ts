import _ from "lodash";
import { FlowEnvironment, FlowEnvironmentContent } from "../types";
import { FlowSignature, InputRowSignature, OutputRowSignature } from "../types/signatures";
import { ArrayTypeSpecifier, MapTypeSpecifier, TypeSpecifier } from "../types/typeSpecifiers";
import { Obj } from "../types/utilTypes";
import { memoizeMulti } from "../utils/functional";

export const createEnvironment = memoizeMulti(
    (content: FlowEnvironmentContent): FlowEnvironment => ({ parent: null, content })
);

export const pushContent = memoizeMulti(
    (parent: FlowEnvironment, content: FlowEnvironmentContent): FlowEnvironment => ({ parent, content })
);
export const popContent = (env: FlowEnvironment) => env.parent;

export const collectTotalEnvironmentContent = memoizeMulti((env: FlowEnvironment): FlowEnvironmentContent => {
    const totalCurr = addAdditionalContent(env.content);
    if (!env.parent) {
        return totalCurr;
    }
    const parent = collectTotalEnvironmentContent(env.parent);
    return {
        // children overwrite parents
        signatures: { ...parent.signatures, ...totalCurr.signatures },
        types: { ...parent.types, ...totalCurr.types },
    };
});

export const findEnvironmentSignature = memoizeMulti(
    (env: FlowEnvironment, signatureId: string): FlowSignature | undefined => 
        collectTotalEnvironmentContent(env).signatures[signatureId]
);
export const findEnvironmentType = memoizeMulti(
    (env: FlowEnvironment, typeName: string): TypeSpecifier | undefined => 
        collectTotalEnvironmentContent(env).types[typeName]
);




const addAdditionalContent = memoizeMulti((scope: FlowEnvironmentContent) => {
    return {
        types: scope.types,
        signatures: {
            ...scope.signatures,
            ...generateLayerTypeSignatures(scope.types),
        }
    };
});

function generateLayerTypeSignatures(types: Obj<TypeSpecifier>) {
    const signatureMap: Obj<FlowSignature> = {};
    for (const [name, type] of Object.entries(types)) {
        const syntaxSignatures = generateTypeSyntaxSignatures(name, type);
        for (const s of syntaxSignatures) {
            signatureMap[s.id] = s;
        }
    }
    return signatureMap;
}

const generateTypeSyntaxSignatures = memoizeMulti((name: string, type: TypeSpecifier) => {
    if (type.type === 'primitive' ||
        type.type === 'list' ||
        type.type === 'unknown' ||
        type.type === 'reference'
    ) {
        return []; // not combinable
    }

    const category = 'Combine/Separate';

    // combiner
    const combiner: FlowSignature = {
        id: `syntax:combine_${name}`,
        name: `Combine ${name}`,
        description: `Combines required data into a ${name}`,
        attributes: { category },
        inputs: getCombinerInputRows(type),
        outputs: [
            {
                id: 'output',
                rowType: 'output',
                label: name,
                dataType: { type: 'reference', name },
            }
        ],
    };

    // separator
    const separator: FlowSignature = {
        id: `syntax:separate_${name}`,
        name: `Separate ${name}`,
        description: `Separates ${name} into its `,
        attributes: { category },
        inputs: [
            {
                id: 'input',
                rowType: 'input-simple',
                dataType: { type: 'reference', name },
                label: name,
            }
        ],
        outputs: getSeparatorOutputRows(type),
    };

    return [combiner, separator];
});

function getCombinerInputRows(type: ArrayTypeSpecifier | MapTypeSpecifier): InputRowSignature[] {
    if (type.type === 'array') {
        let rows: InputRowSignature[] = [];
        for (let i = 0; i < type.length; i++) {
            rows.push({
                id: i.toString(),
                label: (i + 1).toString(),
                dataType: type.elementType,
                rowType: 'input-variable',
                defaultValue: null,
            });
        }
        return rows;
    }
    if (type.type === 'map') {
        const rows = Object.entries(type.elements)
            .sort((a, b) => a[0].localeCompare(b[0]))
            .map(([key, type]) => {
                const row: InputRowSignature = {
                    id: key,
                    label: prettifyLabel(key),
                    dataType: type,
                    rowType: 'input-variable',
                    defaultValue: null,
                };
                return row;
            });
        return rows;
    }
    throw new Error(`Type ${(type as any).type} is not structurable`);
}

function getSeparatorOutputRows(type: ArrayTypeSpecifier | MapTypeSpecifier): OutputRowSignature[] {
    if (type.type === 'array') {
        let rows: OutputRowSignature[] = [];
        for (let i = 0; i < type.length; i++) {
            rows.push({
                id: i.toString(),
                label: (i + 1).toString(),
                dataType: type.elementType,
                rowType: 'output',
            });
        }
        return rows;
    }
    if (type.type === 'map') {
        const rows = Object.entries(type.elements)
            .sort((a, b) => a[0].localeCompare(b[0]))
            .map(([key, type]) => {
                const row: OutputRowSignature = {
                    id: key,
                    label: prettifyLabel(key),
                    dataType: type,
                    rowType: 'output',
                };
                return row;
            });
        return rows;
    }
    throw new Error(`Type ${(type as any).type} is not structurable`);
}

function prettifyLabel(propertyName: string) {
    return _.startCase(propertyName.replaceAll('_', ' ').trim());
}
