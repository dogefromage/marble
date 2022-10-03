import { useEventListener } from "./useEventListener";

export default function useAutoClose(ref: React.RefObject<HTMLElement>, onClose: () => void)
{
    useEventListener('mousedown', e =>
    {
        if (!ref.current?.contains(e.target as Node))
            onClose();

    }, document);
}
