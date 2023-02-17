import produce, { setAutoFreeze } from "immer";

function produceNoFreeze(...args: Parameters<typeof produce>) {
    setAutoFreeze(false);
    const result = produce(...args);
    setAutoFreeze(true);
    return result as ReturnType<typeof produce>;
}

export default produceNoFreeze as typeof produce;
