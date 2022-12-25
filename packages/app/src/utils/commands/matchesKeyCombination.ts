import { KeyCombination } from "../../types/command/KeyCombination";

export default function matchesKeyCombination(
    keyCombination: KeyCombination,
    event: KeyboardEvent
)
{
    if (keyCombination.key.toLowerCase() !== event.key.toLowerCase()) return false;
    
    const altKey = keyCombination.altKey || false;
    const ctrlKey = keyCombination.ctrlKey || false;
    const shiftKey = keyCombination.shiftKey || false;

    if (altKey !== event.altKey) return false;
    if (ctrlKey !== event.ctrlKey) return false;
    if (shiftKey !== event.shiftKey) return false;

    return true;
}