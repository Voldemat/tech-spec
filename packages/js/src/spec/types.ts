import type { ActionResult } from '../types'

export interface FeatureMetadata {
    name: string
}
export type FeatureStringFieldType = (
    'uuid' | 'string' | 'link' | 'date' | 'time' | 'date-time' | 'duration'
)
export type FeatureNumberFieldType = 'int' | 'uint' | 'float'
export interface FeatureStringFieldSpec {
    type: FeatureStringFieldType
    value: string
}
export interface FeatureNumberFieldSpec {
    type: FeatureNumberFieldType
    value: number
}
export type FeatureFieldSpec = FeatureStringFieldSpec | FeatureNumberFieldSpec
export interface Feature {
    type: 'feature'
    metadata: FeatureMetadata
    spec: Record<string, FeatureFieldSpec>
}
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
    placeholder: string | null
    errorMessage: string | null
    helperMessage: string | null
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
export type TechSpec = Form | DesignSystem | Field | Feature

export interface TechSpecContainer {
    designSystems: DesignSystem[]
    forms: Form[]
    features: Feature[]
}
export interface IAction {
    run: (...args: any) => ActionResult
}
