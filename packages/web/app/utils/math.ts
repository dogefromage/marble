

export function clamp(t: number, min = 0, max = 1)
{
    return Math.max(min, Math.min(t, max));
}