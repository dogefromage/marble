import { KeyCombination } from "../../types/command/KeyCombination";


export default function matchesKeyCombination(
    keyCombination: KeyCombination,
    event: KeyboardEvent
)
{
    if (keyCombination.lowerCaseKey !== event.key.toLowerCase()) return false;
    if (keyCombination.altKey && !keyCombination.altKey) return false;
    if (keyCombination.ctrlKey && !keyCombination.ctrlKey) return false;
    if (keyCombination.shiftKey && !keyCombination.shiftKey) return false;

    return true;
}