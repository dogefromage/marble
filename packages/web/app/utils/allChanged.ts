import { useRef } from "react";

export default function allChanged(...deps: any[])
{
    const consistencyCounter = useRef(0);
    const lastDeps = useRef(deps);

    if (deps.find((dep, index) => dep !== lastDeps.current[index]))
    {
        consistencyCounter.current++;
        lastDeps.current = deps;
    }

    return consistencyCounter.current;
}