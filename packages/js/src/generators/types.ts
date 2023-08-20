import type { TechSpec } from '../spec/types'

export type TechSpecAst = Partial<Record<TechSpec['type'], Record<string, any>>>
export type SpecCode = Partial<Record<TechSpec['type'], string>>
export type FeatureCode = Partial<Record<TechSpec['type'], string>>
