import type { ActionResult } from '../types'

export interface FieldMetadata {
    name: string
}
export interface FieldSpec {
    type: string
    regex: RegExp
}
export interface Field {
    type: 'field'
    spec: FieldSpec
    metadata: FieldMetadata
}
export interface FormMetadata {
    name: string
}
export interface FormFieldSpec {
    field: Field
    fieldRef: string
    required: boolean
    errorMessage: string | null
}
export type FormSpec = Record<string, FormFieldSpec>
export interface Form {
    type: 'form'
    metadata: FormMetadata
    spec: FormSpec
}
export interface DesignSystemMetadata {
    name: string
}
export interface DesignSystemSpec {
    colors: Record<string, Record<string, string>>
}
export interface DesignSystem {
    type: 'DesignSystem'
    metadata: DesignSystemMetadata
    spec: DesignSystemSpec
}
export type TechSpec = Form | DesignSystem | Field

export interface TechSpecContainer {
    designSystems: DesignSystem[]
    forms: Form[]
}
export interface IAction {
    run: (...args: any) => ActionResult
}
