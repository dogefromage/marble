const { parse } = require('../lib/parser');

const sampleProgram = `

vec3 test(int a, float b) {
    return vec3();
}

`;

describe('Parser', () => {
    test('Runs', () => {

        const ast = parse(sampleProgram);
        console.log(ast);
    })
})