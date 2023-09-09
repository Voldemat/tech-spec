import type { TypeSpec } from '../spec/types/type'

export interface ValidationFormFieldSpec<T extends TypeSpec> {
    typeSpec: T
    required: boolean
    errorMessage: string | null
}
export type FormValidationSpec = Record<
    string, ValidationFormFieldSpec<TypeSpec>
>
export interface IValidatorResult {
  isValid: boolean
  errorMessage: string | null
}
export type ValidatorFunc = (
    value: string | File | null
) => Promise<IValidatorResult> | IValidatorResult
export const successValidatorResult: IValidatorResult = {
    isValid: true,
    errorMessage: null
}
