import { EnvironmentContent, FlowEnvironment } from "../types/environments";
import { FlowSignature, FlowSignatureId, InputRowSignature, OutputRowSignature } from "../types/signatures";
import { ArrayTypeSpecifier, MapTypeSpecifier, TypeSpecifier } from "../types/typeSpecifiers";
import { Obj } from "../types/utilTypes";

export class LinkedFlowEnvironment implements FlowEnvironment {
    private parent: LinkedFlowEnvironment | null = null;
    private content: EnvironmentContent;

    constructor(
        baseContent: EnvironmentContent
    ) {
        this.content = {
            types: baseContent.types,
            signatures: {
                ...baseContent.signatures,
                ...generateLayerTypeSignatures(baseContent.types),
            }
        }
    }

    public push(content: EnvironmentContent): LinkedFlowEnvironment {
        const next = new LinkedFlowEnvironment(content);
        next.parent = this;
        return next;
    }
    public pop(): LinkedFlowEnvironment {
        if (!this.parent) {
            throw new Error(`Top scope cannot be popped`);
        }
        return this.parent;
    }

    public getSignature(signatureId: FlowSignatureId): FlowSignature | undefined {
        return this.getTotalContent().signatures[signatureId];
    }
    public getType(name: string): TypeSpecifier | undefined {
        return this.getTotalContent().types[name];
    }

    private getContentList(): EnvironmentContent[] {
        if (this.parent) {
            return [this.content, ...this.parent.getContentList()];
        } else {
            return [this.content];
        }
    }
    public getTotalContent(): EnvironmentContent {
        const contentList = this.getContentList();
        const baseContent: EnvironmentContent = {
            signatures: {},
            types: {},
        };
        // older content should be overwritten by newer content
        const totalContent = contentList.reduceRight((acc, curr) => {
            acc.signatures = { ...acc.signatures, ...curr.signatures };
            acc.types = { ...acc.types, ...curr.types };
            return acc;
        }, baseContent);
        return totalContent;
    }
}

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

function generateTypeSyntaxSignatures(name: string, type: TypeSpecifier) {
    if (type.type === 'primitive' ||
        type.type === 'list' ||
        type.type === 'unknown' ||
        type.type === 'reference'
    ) {
        return []; // not combinable
    }

    // combiner
    const combiner: FlowSignature = {
        id: `syntax:combine_${name}`,
        version: 0,
        name: `Combine ${name}`,
        description: `Combines required data into a ${name}`,
        attributes: {
            category: 'Types',
        },
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
        version: 0,
        name: `Separate ${name}`,
        description: `Separates ${name} into its `,
        attributes: {
            category: 'Types',
        },
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
}

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
                    label: key,
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
                    label: key,
                    dataType: type,
                    rowType: 'output',
                };
                return row;
            });
        return rows;
    }
    throw new Error(`Type ${(type as any).type} is not structurable`);
}