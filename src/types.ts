export interface ActionResult {
    isError: boolean
    message: string
}
export interface FormMetadata {
    name: string
}
export interface FormFieldSpec {
    regex: string
    required: boolean
    errorMessage: string | null
}
export interface FormSpec {
    [key: string]: FormFieldSpec
}
export interface Form {
    type: 'form'
    metadata: FormMetadata
    spec: FormSpec
}
export type TechSpec = Form