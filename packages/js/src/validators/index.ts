import type { ImageTypeSpec, TypeSpec } from '../spec/types/type'
import {
    successValidatorResult,
    type ValidationFormFieldSpec,
    type ValidatorFunc,
    type IValidatorResult
} from './types'
import {
    createValidationError,
    isImageValid,
    isScalarValueValid
} from './utils'

async function validateImage (
    value: string | File | null,
    imageSpec: ImageTypeSpec,
    errorResult: IValidatorResult,
    successValidatorResult: IValidatorResult
): Promise<IValidatorResult> {
    if (!(value instanceof File)) return errorResult
    const isValid = await isImageValid(value, imageSpec)
    return isValid
        ? successValidatorResult
        : errorResult
}

export function buildValidator<T extends ImageTypeSpec> (
    spec: ValidationFormFieldSpec<T>
): (value: string | File | null) => Promise<IValidatorResult>
export function buildValidator<T extends Exclude<TypeSpec, ImageTypeSpec>> (
    spec: ValidationFormFieldSpec<T>
): (value: string | File | null) => IValidatorResult
export function buildValidator<T extends TypeSpec> (
    spec: ValidationFormFieldSpec<T>
): ValidatorFunc {
    const errorResult = createValidationError(spec.errorMessage)
    // eslint-disable-next-line @typescript-eslint/promise-function-async
    return (value: string | File | null) => {
        if (spec.required && value === null) return errorResult
        if (value === null) return errorResult
        if (spec.typeSpec.type !== 'image') {
            return (
                isScalarValueValid(value, spec.typeSpec)
                    ? successValidatorResult
                    : errorResult
            )
        } else {
            return validateImage(
                value,
                spec.typeSpec,
                errorResult,
                successValidatorResult
            )
        }
    }
}
