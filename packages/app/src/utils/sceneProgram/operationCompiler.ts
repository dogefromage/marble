import { GeometryEdge, GNodeS, GNodeT, ObjMap, ProgramConstant, ProgramTextureVar } from "../../types";
import { formatValueGLSL, textureLookupDatatype } from "../codeGeneration/formatValue";
import { Counter } from "../Counter";
import { GeometriesCompilationError } from "./compilationError";
import { RowVarNameGenerator } from "./curriedRowVarNameGenerator";

function createConstantCode(c: ProgramConstant)
{
    const rhs = formatValueGLSL(c.value, c.dataType);
    return `${c.dataType} ${c.name} = ${rhs};`
}

function createTextureVarCode(tv: ProgramTextureVar)
{
    const rhs = textureLookupDatatype(tv.textureCoordinate, tv.dataType);
    return `${tv.dataType} ${tv.name} = ${rhs};`
}

export function compileNodeInstructions(
    nodeIndex: number,
    node: GNodeS,
    template: GNodeT,
    textureCoordinateCounter: Counter,
    incomingEdges: ObjMap<GeometryEdge[]>,
)
{
    const varNameGenerator = new RowVarNameGenerator(
        nodeIndex, node, template,
        textureCoordinateCounter, 
        incomingEdges, 
    );

    const compiledInstructions: string[] = [];
    const includedTokens: string[] = [];

    const instructionTemplateLines = template.instructionTemplates.split('\n');

    for (const line of instructionTemplateLines)
    {
        const trimmedLine = line.trim();

        if (!trimmedLine.length) continue; // empty

        // 1. includes
        const includeRegex = /#INCLUDE\s+([\w]+(?:\s*\,\s*[\w]+)*)\s*;/;
        const includeMatch = trimmedLine.match(includeRegex);
        if (includeMatch)
        {
            const tokensMatch = includeMatch[1] || '';
            tokensMatch
                .split(',')
                .forEach(token => 
                    includedTokens.push(token.trim())
                );
            
            continue; // trim line from instructions
        }

        // 3. instruction
        let compiledLine = trimmedLine;

        /** STACKS */
        const stackRegex = /#STACK\((.+)\)/;
        while (true)
        {
            const match = compiledLine.match(stackRegex);
            if (!match) break;

            const totalStackCall = match[0];

            const args = match[1];

            const stackParams = [ ...args.matchAll(/([^,(\s]+(?=,|$)|[\w]+\(.*\)(?=,|$))/g) ]
                .map(regMatch => regMatch[0]);

            if (stackParams.length !== 3) 
            {
                console.log(match[1]);
                throw new GeometriesCompilationError(`Stacked arguments must have three arguments`)
            }
            const [ fn_name, stackedRowIdentifier, defaultValue ] = stackParams;

            const varNames = varNameGenerator.stacked(stackedRowIdentifier);

            let stackedExpression;
            
            if (varNames.length === 0)
            {
                stackedExpression = defaultValue;
            }
            else if (varNames.length === 1)
            {
                stackedExpression = varNames[0];
            }
            else 
            {
                stackedExpression = varNames[0];
                for (let i = 1; i < varNames.length; i++)
                {
                    const newIdentifier = varNames[i];
                    stackedExpression = `${fn_name}(${stackedExpression}, ${newIdentifier})`;
                }
            }

            compiledLine = compiledLine.replace(totalStackCall, stackedExpression);
        }

        /** ROW INJECTIONS */
        const rowInjectionMatch = /\$\w+/;
        while (true)
        {
            const match = compiledLine.match(rowInjectionMatch);
            if (!match) break;

            const rowName = match[0];
            
            let varName: string;

            // check if assignation
            const indexOfVar = compiledLine.indexOf(rowName);
            const equalsIndex = compiledLine.indexOf('=');
            const isAssignation = equalsIndex >= 0 && indexOfVar < equalsIndex;

            if (isAssignation)
            {
                varName = varNameGenerator.output(rowName);
            }
            else
            {
                varName = varNameGenerator.input(rowName);
            }

            compiledLine = compiledLine.replace(rowName, varName);
        }

        compiledInstructions.push(compiledLine);
    }

    const { constants, textureVars, textureVarMappings } = varNameGenerator.popIncrementalMetadata();
    const constantCode = constants.map(createConstantCode);
    const textureVarCode = textureVars.map(createTextureVarCode);

    const totalInstructions = [
        ...constantCode,
        ...textureVarCode,
        ...compiledInstructions,
    ];

    return {
        instructions: totalInstructions,
        includedTokens,
        textureVarMappings,
    };
}
