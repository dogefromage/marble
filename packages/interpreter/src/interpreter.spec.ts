import { parser } from '@shaderfrog/glsl-parser';
import { Interpreter } from '.';

const glsl = (strings: TemplateStringsArray, ...values: string[]) => 
    String.raw({ raw: strings }, ...values);

describe('Interpreter', () => {
    test('Test', () => {
        const ast = parser.parse(glsl`
            int add(int a, int b) {
                return a + b;
            }
        `);
        const interpreter = new Interpreter();
        interpreter.loadAst(ast);
    });
});