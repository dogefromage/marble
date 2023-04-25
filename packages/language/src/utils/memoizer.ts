

export class Memoizer {
    private last: any;

    public getMemoized(curr: any) {
        this.last = this.memoizedRecursive(curr, this.last);
        return this.last;
    }

    private memoizedRecursive(curr: any, last: any) {
        if (curr == null || last == null) {
            return curr;
        }

        if (typeof curr !== 'object' || typeof last !== 'object') {
            return curr;
        }

        if (Object.keys(curr))

        for (const key in curr) {
            const memoizedProp = this.memoizedRecursive(curr[key], last[key]);
            if (curr[key] !== memoizedProp) {
                return curr; // object has changed
            }
        }
    }
}