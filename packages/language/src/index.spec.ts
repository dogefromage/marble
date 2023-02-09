const { parse } = require('../lib/parser');
const fs = require('fs');
const path = require('path');

function safeStringify(obj, indent = 2) {
    const seen = new WeakSet();
    return JSON.stringify(obj, (key, value) => {
        if (typeof value === "object" && value !== null) {
            if (seen.has(value)) {
                return '[CIRCULAR]';
            }
            seen.add(value);
        }
        return value;
    }, indent);
}




const sampleProgram = `

vec3:(int,int) test(int:() a, float b) {
    return vec3();
}
`;

describe('Parser', () => {
    test('Runs', () => {

        const ast = parse(sampleProgram);

        const json = safeStringify(ast);
        fs.writeFileSync(path.resolve('./ast.json'), json);
    })
})