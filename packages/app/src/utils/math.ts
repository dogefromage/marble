

export function clamp(t: number, min = 0, max = 1) {
    return Math.max(min, Math.min(t, max));
}

export function degToRad(degs: number) {
    return degs * Math.PI / 180;
}

// https://stackoverflow.com/questions/175739/how-can-i-check-if-a-string-is-a-valid-number
export function isIntegerString(str: any) {
    if (typeof str != "string") return false // we only process strings!  
    return !isNaN(str as any) && // use type coercion to parse the _entirety_ of the string (`parseFloat` alone does not do this)...
           !isNaN(parseFloat(str)) // ...and ensure strings of whitespace fail
  }