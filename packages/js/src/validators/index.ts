import { type FieldSpec } from '../spec/types'

export interface ValidationFormFieldSpec {
    field: FieldSpec
    fieldRef: string
    required: boolean
    errorMessage: string | null
}
export type FormValidationSpec = Record<string, ValidationFormFieldSpec>
export interface ValidatorError {
  isValid: boolean
  errorMessage: string | null
}
export type ValidatorFunc = (value: string | null) => ValidatorError
export const successValidatorResult: ValidatorError = {
    isValid: true,
    errorMessage: null
}
export function validateFormField (
    spec: ValidationFormFieldSpec,
    v: string | null
): ValidatorError {
    const errorResult: ValidatorError = {
        isValid: false,
        errorMessage: spec.errorMessage
    }
    if (v === null) {
        if (spec.required) {
            return errorResult
        }
        return successValidatorResult
    }
    if (!spec.field.regex.test(v)) {
        return errorResult
    }
    return successValidatorResult
}
export function buildValidator (spec: ValidationFormFieldSpec): ValidatorFunc {
    return (v: string | null) => {
        return validateFormField(spec, v)
    }
}
export type FormValidators<T extends FormValidationSpec> = {
  [key in keyof T]: ValidatorFunc
}
export function buildValidators<T extends FormValidationSpec> (
    form: T
): FormValidators<T> {
    const entries = Object.entries(
        form
    ) as Array<[keyof T, ValidationFormFieldSpec]>
    return entries.reduce<Partial<FormValidators<T>>>(
        (obj, entry) => {
            const [key, field] = entry
            obj[key] = buildValidator(field)
            return obj
        },
        {}
    ) as FormValidators<T>
}
