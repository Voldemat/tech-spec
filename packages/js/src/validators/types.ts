import type {
    EnumTypeSpec,
    ImageTypeSpec,
    TypeSpec,
    UnionTypeSpec
} from '../spec/types/type'

export interface ValidationFormFieldSpec<T extends TypeSpec> {
    typeSpec: T | any
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

export type ScalarValidInput = Exclude<
    TypeSpec,
    ImageTypeSpec | EnumTypeSpec | UnionTypeSpec
> | EnumCodeTypeSpec | UnionCodeTypeSpec

export type EnumCodeTypeSpec = (
    EnumTypeSpec & {
        itemTypeSpec: ScalarValidInput
    }
)

export type UnionCodeTypeSpec = (
    UnionTypeSpec & {
        typeSpecs: ScalarValidInput[]
    }
)
