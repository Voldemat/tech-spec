export interface ActionResult {
  isError: boolean
  messages: string[]
}
export const FILE_SPEC_EXTENSION = '.tech-spec.yaml'
export interface ILoaderSuccessResult {
    data: Array<Record<string, any>>
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
export interface IAction {
    run: (...args: any) => ActionResult
}
