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
export interface DateTypeSpec {
    type: 'date'
    allowOnly: 'future' | 'past' | null
}
export interface TimeTypeSpec {
    type: 'time'
    allowOnly: 'future' | 'past' | null
}
export interface DateTimeTypeSpec {
    type: 'datetime'
    allowOnly: 'future' | 'past' | null
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
export type ScalarTypeSpec = (
    StringTypeSpec |
    IntTypeSpec |
    FloatTypeSpec |
    DateTypeSpec |
    TimeTypeSpec |
    DateTimeTypeSpec |
    FileTypeSpec |
    ImageTypeSpec
)
export interface EnumTypeSpec {
    type: 'enum'
    itemType: string
    itemTypeSpec: ScalarTypeSpec
}
export type ScalarTypeSpecWithEnum = ScalarTypeSpec | EnumTypeSpec
export interface UnionTypeSpec {
    type: 'union'
    types: string[]
    typeSpecs: Record<string, ScalarTypeSpecWithEnum>
}
export type TypeSpec = (
    ScalarTypeSpecWithEnum |
    UnionTypeSpec
)
export type Type = BaseTechSpec<'type', TypeMetadata, TypeSpec>
