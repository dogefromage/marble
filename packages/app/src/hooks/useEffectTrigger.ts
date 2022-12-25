import { useCallback, useState } from "react";

export default function useEffectTrigger()
{
    const [ dep, setDep ] = useState(1);

    const trigger = useCallback(() =>
    {
        setDep(last => (last % 100000) + 1);
    }, [ setDep ])

    return [ dep, trigger ] as [ typeof dep, typeof trigger ];
}