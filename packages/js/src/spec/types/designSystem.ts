import { type BaseTechSpec } from './base'

export interface DesignSystemMetadata {
    name: string
}
export interface DesignSystemSpec {
    colors: Record<string, Record<string, string>>
}
export type DesignSystem = BaseTechSpec<
    'DesignSystem', DesignSystemMetadata, DesignSystemSpec
>
