export type Entries<T> = Array<{
    [K in keyof T]: [K, T[K]];
}[keyof T]>

export function getEntries<T extends object> (obj: T): Entries<T> {
    return Object.entries(obj) as Entries<T>
}

type ValueOf<T> = T[keyof T]

type NonEmptyArray<T> = [T, ...T[]]

type MustInclude<T, U extends T[]> = [T] extends [ValueOf<U>] ? U : never

export function stringUnionToArray<T> () {
    return <U extends NonEmptyArray<T>>(
        ...elements: MustInclude<T, U>
    ) => elements
}
