

export type Override<T, K extends keyof T, N> = Omit<T, K> & { [K1 in K]: N };