import type { ActionResult } from '../types'

export interface FormMetadata {
    name: string
}
export interface FormFieldSpec {
    regex: string
    required: boolean
    errorMessage: string | null
}
export type FormSpec = Record<string, FormFieldSpec>
export interface Form {
    type: 'form'
    metadata: FormMetadata
    spec: FormSpec
}
export type TechSpec = Form

export interface ILoader {
    load: (content: string) => Record<string, any>
}
export interface IAction {
    run: (...args: any) => ActionResult
}
