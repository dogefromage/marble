

function iadd(a: number, b: number) {
    return (a + b) | 0;
}

export default function (A: number[]) {

    let x = 0;
    for (let i = 0; i < A.length; i++) {
        x = iadd(x, A[i]);
        // hash x
        x = Math.imul((x >> 16) ^ x, 0x45d9f3b);
        x = Math.imul((x >> 16) ^ x, 0x45d9f3b);
        x = (x >> 16) ^ x;
        // xor values
    }
    return x;
}