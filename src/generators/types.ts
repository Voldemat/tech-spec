import type { TechSpec } from '../spec/types'

export type TechSpecAst = Record<TechSpec['type'], Record<string, any> | null>
export type SpecCode = Record<TechSpec['type'], string | null>
