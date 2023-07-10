export type Entries<T> = Array<{
    [K in keyof T]: [K, T[K]];
}[keyof T]>

export function getEntries<T extends object> (obj: T): Entries<T> {
    return Object.entries(obj) as Entries<T>
}
