import { useEffect, useState } from "react";


export default function (ref: React.RefObject<HTMLElement>) {
    const [ focused, setFocused ] = useState(false);

    useEffect(() => {
        const el = ref.current;
        if (el == null) return;
        
        const focus = () => setFocused(true);
        const blur  = () => setFocused(false);

        el.addEventListener('focus', focus);
        el.addEventListener('blur', blur);

        return () => {
            el.removeEventListener('focus', focus);
            el.removeEventListener('blur', blur);
        }

    }, [ ref.current ]);
    
    return focused;
}