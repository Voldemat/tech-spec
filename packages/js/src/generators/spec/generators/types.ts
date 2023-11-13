import type ts from 'typescript'
import { type FormFieldSpec } from '../../../spec/types/forms'
import { type DateTimeTypeSpec, type DateTypeSpec, type EnumTypeSpec, type FileTypeSpec, type FloatTypeSpec, type ImageTypeSpec, type IntTypeSpec, type StringTypeSpec, type TimeTypeSpec, Type, type TypeSpec, type UnionTypeSpec } from '../../../spec/types/type'
import { stringUnionToArray } from '../../../utils'

export interface FormFieldAst {
    type: ts.StringLiteral
    required: ts.BooleanLiteral
    maxLength: ts.NumericLiteral | ts.NullLiteral
    placeholder: ts.StringLiteral | ts.NullLiteral
    errorMessage: ts.StringLiteral | ts.NullLiteral
    helperMessage: ts.StringLiteral | ts.NullLiteral
}

interface BaseTypeAst<T extends TypeSpec> {
    type: T['type']
}

export interface StringTypeAst extends BaseTypeAst<StringTypeSpec> {
    regex: ts.RegularExpressionLiteral
}

export interface NumericTypeAst extends BaseTypeAst<
    IntTypeSpec | FloatTypeSpec
> {
    max: ts.NumericLiteral | ts.NullLiteral
    min: ts.NumericLiteral | ts.NullLiteral
}

export interface DateTimeTypeAst extends BaseTypeAst<
    TimeTypeSpec | DateTypeSpec | DateTimeTypeSpec
> {
    allowOnly: ts.StringLiteral | ts.NullLiteral
}

export interface FileSizeAst {
    unit: ts.StringLiteral
    value: ts.NumericLiteral
}

export interface FileTypeAst extends BaseTypeAst<FileTypeSpec> {
    allowedMimeTypes: ts.ArrayLiteralExpression | ts.NullLiteral
    maxSize: FileSizeAst | null
    minSize: FileSizeAst | null
}

export interface ImageAspectRatioAst {
    width: ts.NumericLiteral
    height: ts.NumericLiteral
}

export interface ImageTypeAst extends BaseTypeAst<ImageTypeSpec> {
    allowedTypes: ts.ArrayLiteralExpression | ts.NullLiteral
    maxSize: FileSizeAst | null
    minSize: FileSizeAst | null
    maxWidth: ts.NumericLiteral | ts.NullLiteral
    minWidth: ts.NumericLiteral | ts.NullLiteral
    maxHeight: ts.NumericLiteral | ts.NullLiteral
    minHeight: ts.NumericLiteral | ts.NullLiteral
    aspectRatio: ImageAspectRatioAst | ts.NullLiteral
}

export interface EnumTypeAst extends BaseTypeAst<EnumTypeSpec> {
    itemType: ts.StringLiteral
    items: ts.ArrayLiteralExpression
}

export interface UnionTypeAst extends BaseTypeAst<UnionTypeSpec> {
    types: ts.ArrayLiteralExpression
}

export type TypeAst = (
    StringTypeAst |
    NumericTypeAst |
    ImageTypeAst |
    FileTypeAst |
    EnumTypeAst |
    UnionTypeAst |
    DateTimeTypeAst
)

export const formFieldPropertyNames = stringUnionToArray<keyof FormFieldSpec>()(
    'type',
    'errorMessage',
    'helperMessage',
    'placeholder',
    'required',
    'maxLength'
)

export const typeSpecTypes = stringUnionToArray<TypeSpec['type']>()(
    'string',
    'int',
    'float',
    'enum',
    'union',
    'file',
    'image',
    'date',
    'time',
    'datetime'
)

export const imageTypeSpecPropertyNames = stringUnionToArray<
    keyof ImageTypeAst
>()(
    'type',
    'maxSize',
    'minSize',
    'maxWidth',
    'minWidth',
    'aspectRatio',
    'allowedTypes',
    'minHeight',
    'maxHeight'
)
