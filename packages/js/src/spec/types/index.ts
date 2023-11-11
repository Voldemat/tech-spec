import type { Type } from './type'
import type { DesignSystem } from './designSystem'
import type { Feature } from './feature'
import type { Form } from './forms'

export interface TechSpecContainer {
    designSystems: DesignSystem[]
    forms: Form[]
    features: Feature[]
    types: Type[]
}

export type TechSpec = Form | Feature | Type | DesignSystem

export type {
    Type,
    DesignSystem,
    Feature,
    Form
}
