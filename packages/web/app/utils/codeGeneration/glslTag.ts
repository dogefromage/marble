

export const glsl = (stringArr: TemplateStringsArray, ...values: any[]) => 
    String.raw({ raw: stringArr }, ...values);