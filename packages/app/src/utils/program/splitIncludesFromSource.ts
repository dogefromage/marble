import { ProgramInclude } from "../../types";

export default function (source: string) {

    const matches = [ ...source.matchAll(/#\s*DEFINCLUDE\s+(\w+);/g) ];

    const includes: ProgramInclude[] = [];

    for (let i = matches.length - 1; i >= 0; i--) {

        const lastMatchIndex = matches[i].index!;
        const sourceStart = lastMatchIndex + matches[i][0].length; // add offset of marker preprocessor
        const includeSrc = source.substring(sourceStart);
        // reduce source
        source = source.substring(0, lastMatchIndex);

        includes.push({
            id: matches[i][1]!,
            source: includeSrc,
        });
    }

    return includes;
}