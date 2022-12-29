

export default function (A: number[]) {

    let y = 0;
    for (let i = 0; i < A.length; i++) {
        let x = A[i];
        // hash x
        x = Math.imul((x >> 16) ^ x, 0x45d9f3b);
        x = Math.imul((x >> 16) ^ x, 0x45d9f3b);
        x = (x >> 16) ^ x;
        // xor values
        y ^= x;
    }
    return y;
}