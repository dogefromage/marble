

export default function<T extends Error>(e: any, Type: new (...args: any[]) => T): e is T
{
    if (!(e instanceof Type)) {
        throw e;
    }
    return true;
}