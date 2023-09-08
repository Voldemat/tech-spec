import { type BaseTechSpec } from './base'

export interface FeatureMetadata {
    name: string
}
export type FeatureStringFieldType = (
    'uuid' | 'string' | 'link' | 'date' | 'time' | 'date-time' | 'duration'
)
export type FeatureNumberFieldType = 'int' | 'uint' | 'float'
export interface FeatureStringFieldSpec {
    type: FeatureStringFieldType
    value: string
}
export interface FeatureNumberFieldSpec {
    type: FeatureNumberFieldType
    value: number
}
export type FeatureFieldSpec = FeatureStringFieldSpec | FeatureNumberFieldSpec
export type FeatureSpec = Record<string, FeatureFieldSpec>
export type Feature = BaseTechSpec<'feature', FeatureMetadata, FeatureSpec>
