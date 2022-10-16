import { useCallback, useState } from "react";


export default function useEffectTrigger()
{
    const [ dep, setDep ] = useState(0);

    const trigger = useCallback(() =>
    {
        setDep(last => (last + 1) % 100000);
    }, [ setDep ])

    return [ dep, trigger ] as [ typeof dep, typeof trigger ];
}