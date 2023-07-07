import { type FormFieldSpec } from '../types'

export type FormValidationSpec = Record<string, FormFieldSpec>
export interface ValidatorError {
  isValid: boolean
  errorMessage: string | null
}
export type ValidatorFunc = (value: string | null) => ValidatorError
export function buildValidator (spec: FormFieldSpec): ValidatorFunc {
    const regex = new RegExp(spec.regex)
    return (v: string | null) => {
        if (v === null) {
            if (spec.required) {
                return {
                    isValid: false,
                    errorMessage: spec.errorMessage
                }
            }
            return {
                isValid: true,
                errorMessage: null
            }
        }
        if (!regex.test(v)) {
            return {
                isValid: false,
                errorMessage: spec.errorMessage
            }
        }
        return {
            isValid: true,
            errorMessage: null
        }
    }
}
export type FormValidators<T extends FormValidationSpec> = {
  [key in keyof T]: ValidatorFunc
}
export function buildValidators<T extends FormValidationSpec> (
    form: T
): FormValidators<T> {
    const entries = Object.entries(form) as Array<[keyof T, FormFieldSpec]>
    return entries.reduce<FormValidators<T>>(
        (obj, entry) => {
            const [key, field] = entry
            obj[key] = buildValidator(field)
            return obj
        },
        {}
    )
}
