

export function clamp(t: number, min = 0, max = 1)
{
    return Math.max(min, Math.min(t, max));
}

export function degToRad(degs: number)
{
    return degs * Math.PI / 180;
}