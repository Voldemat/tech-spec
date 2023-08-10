import { type FormFieldSpec } from '../spec/types'

export type FormValidationSpec = Record<string, FormFieldSpec>
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
    spec: FormFieldSpec,
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
    if (!spec.field.spec.regex.test(v)) {
        return errorResult
    }
    return successValidatorResult
}
export function buildValidator (spec: FormFieldSpec): ValidatorFunc {
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
    const entries = Object.entries(form) as Array<[keyof T, FormFieldSpec]>
    return entries.reduce<Partial<FormValidators<T>>>(
        (obj, entry) => {
            const [key, field] = entry
            obj[key] = buildValidator(field)
            return obj
        },
        {}
    ) as FormValidators<T>
}
