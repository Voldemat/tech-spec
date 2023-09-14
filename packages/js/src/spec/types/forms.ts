import { type BaseTechSpec } from './base'
import { type TypeSpec } from './type'

export interface FormFieldSpec {
    type: string
    typeSpec: TypeSpec
    required: boolean
    placeholder: string | null
    errorMessage: string | null
    helperMessage: string | null
    maxLength: number | null
}
export interface FormMetadata {
    name: string
}
export type FormSpec = Record<string, FormFieldSpec>
export type Form = BaseTechSpec<'form', FormMetadata, FormSpec>
