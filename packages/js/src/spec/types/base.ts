export interface BaseTechSpec<
    T extends string,
    M extends Record<string, any>,
    S extends Record<string, any>
> {
    type: T
    metadata: M
    spec: S
}
