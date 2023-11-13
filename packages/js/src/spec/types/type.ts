import type { BaseTechSpec } from './base'

export interface TypeMetadata {
    name: string
}
export interface StringTypeSpec {
    type: 'string'
    regex: RegExp
}
export interface IntTypeSpec {
    type: 'int'
    min: number | null
    max: number | null
}
export interface FloatTypeSpec {
    type: 'float'
    min: number | null
    max: number | null
}
export interface BaseDateTimeTypeSpec {
    allowOnly: 'future' | 'past' | null
}
export interface DateTypeSpec extends BaseDateTimeTypeSpec {
    type: 'date'
}
export interface TimeTypeSpec extends BaseDateTimeTypeSpec {
    type: 'time'
}
export interface DateTimeTypeSpec extends BaseDateTimeTypeSpec {
    type: 'datetime'
}
export interface FileSize {
    unit: 'b' | 'kb' | 'mb' | 'gb'
    value: number
}
export interface FileTypeSpec {
    type: 'file'
    allowedMimeTypes: string[] | null
    maxSize: FileSize | null
    minSize: FileSize | null
}
export type ImageTypes = 'jpeg' | 'png' | 'webp' | 'svg'
export interface ImageAspectRatio {
    width: number
    height: number
}
export interface ImageTypeSpec {
    type: 'image'
    allowedTypes: ImageTypes[] | null
    maxSize: FileSize | null
    minSize: FileSize | null
    maxWidth: number | null
    minWidth: number | null
    maxHeight: number | null
    minHeight: number | null
    aspectRatio: ImageAspectRatio | null
}
export type BaseScalarTypeSpec = (
    StringTypeSpec |
    IntTypeSpec |
    FloatTypeSpec |
    DateTypeSpec |
    TimeTypeSpec |
    DateTimeTypeSpec
)
export type ScalarTypeSpec = (
    BaseScalarTypeSpec |
    FileTypeSpec |
    ImageTypeSpec
)
export interface EnumTypeSpec {
    type: 'enum'
    itemType: string
    items: string[]
}
export type BaseScalarTypeSpecWithEnum = BaseScalarTypeSpec | EnumTypeSpec
export interface UnionTypeSpec {
    type: 'union'
    types: string[]
}
export type TypeSpec = (
    ScalarTypeSpec |
    EnumTypeSpec |
    UnionTypeSpec
)
export type Type = BaseTechSpec<'type', TypeMetadata, TypeSpec>
