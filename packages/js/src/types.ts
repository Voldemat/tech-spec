export interface ActionResult {
  isError: boolean
  messages: string[]
}
export const FILE_SPEC_EXTENSION = '.tech-spec.yaml'
export interface ILoaderSuccessResult {
    data: Record<string, any>
    error: null
}
export interface ILoaderErrorResult {
    data: null
    error: string
}
export type ILoaderResult = ILoaderErrorResult | ILoaderSuccessResult
export interface ILoader {
    load: (filepath: string) => ILoaderResult
}
