
export function generateBinaryInvocationTree(functionName: string, args: string[]): string
{
    if (args.length <= 0)
        throw new Error(`args.length must be > 0`)

    if (args.length === 1) return args[0];

    // { args.length >= 2 }

    const m = Math.ceil(args.length / 2);

    const l_args = args.slice(0, m);
    const r_args = args.slice(m);

    const l_code = generateBinaryInvocationTree(functionName, l_args);
    const r_code = generateBinaryInvocationTree(functionName, r_args);

    return `${functionName}(${l_code}, ${r_code})`;
}