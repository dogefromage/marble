import { parse } from '../lib';
import fs from 'fs';
import path from 'path';

function safeStringify(obj: any, indent = 2) {
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




describe('Parser', () => {

    test('Parses normal glsl program', () => {

        parse(`
            float test(int a) {
                return (5.0 + mod(1, 2)).xyz;
            }
        `);
    })


    test('Parses lambda program', () => {
        try {
            const ast = parse(`
                vec3:(int,int) test(int:() a, float b) {
                    lambda (int a) : a * 5;
                }
    
                float:() test(int a, float b) {
                    return lambda () : a * 5;
                }
            `);

            const json = safeStringify(ast);
            fs.writeFileSync(path.resolve('./ast.json'), json);

        } catch (e) {
            console.log(e);
            
            const json = safeStringify(e);
            fs.writeFileSync(path.resolve('./ast.json'), json);
            throw e;
        }

    })
})