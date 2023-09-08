import type { TypeSpec } from '../spec/types/type'

export interface ValidationFormFieldSpec {
    typeSpec: TypeSpec
    type: string
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
function createValidationError (error: string | null): ValidatorError {
    return {
        isValid: false,
        errorMessage: error
    }
}
function isNumberValueValid (
    n: number | typeof NaN,
    min: number | null,
    max: number | null
): boolean {
    return (
        !Number.isNaN(n) &&
        (max === null || n < max) &&
        (min === null || n > min)
    )
}
function isValueValid (v: string, typeSpec: TypeSpec): boolean {
    switch (typeSpec.type) {
    case 'string': {
        return typeSpec.regex.test(v)
    }
    case 'int': {
        return isNumberValueValid(parseInt(v, 10), typeSpec.min, typeSpec.max)
    }
    case 'float': {
        return isNumberValueValid(parseFloat(v), typeSpec.min, typeSpec.max)
    }
    default: {
        throw new Error(`Unhandled type ${JSON.stringify(typeSpec)}`)
    }
    }
}
export function validateFormField (
    spec: ValidationFormFieldSpec,
    v: string | null
): ValidatorError {
    const errorResult = createValidationError(spec.errorMessage)
    const isValid = (
        (!spec.required || v !== null) &&
        (v === null || isValueValid(v, spec.typeSpec))
    )
    if (!isValid) return errorResult
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
