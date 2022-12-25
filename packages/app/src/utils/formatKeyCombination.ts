import { KeyCombination } from "../types/command/KeyCombination";

export default function formatKeyCombination(combination: KeyCombination)
{
    const tags = [] as string[];

    if (combination.ctrlKey) tags.push('Ctrl');
    if (combination.altKey) tags.push('Alt');
    if (combination.shiftKey) tags.push('Shift');

    const key = combination.displayName || combination.key;
    const firstLetterUppercase = key.charAt(0).toUpperCase() + key.slice(1);
    tags.push(firstLetterUppercase);

    return tags.join('+');
}