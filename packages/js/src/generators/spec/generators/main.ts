import ts from 'typescript'
import type { TechSpec, TechSpecContainer } from '../../../spec/types'
import { FormsSpecGenerator } from './forms'
import { TypesSpecGenerator } from './types-gen'
import { FeaturesSpecGenerator } from './features'
import { DesignSystemsSpecGenerator } from './designSystems'

export class SpecGenerator {
    private readonly forms: FormsSpecGenerator
    private readonly types: TypesSpecGenerator
    private readonly features: FeaturesSpecGenerator
    private readonly designSystems: DesignSystemsSpecGenerator
    constructor () {
        this.forms = new FormsSpecGenerator()
        this.types = new TypesSpecGenerator()
        this.features = new FeaturesSpecGenerator()
        this.designSystems = new DesignSystemsSpecGenerator()
    }

    fromCode (
        code: Partial<Record<TechSpec['type'], string>>
    ): TechSpecContainer {
        return {
            forms: this.forms.getSpec(this.extractNodesFromCode(code.form)),
            designSystems: this.designSystems.getSpec(
                this.extractNodesFromCode(code.DesignSystem)
            ),
            features: this.features.getSpec(
                this.extractNodesFromCode(code.feature)
            ),
            types: this.types.getSpec(this.extractNodesFromCode(code.type))
        }
    }

    private extractNodesFromCode (code: string | undefined): ts.Node[] {
        if (code === undefined) return []
        return Array.from(
            ts.createSourceFile(
                '',
                code,
                ts.ScriptTarget.Latest,
                false,
                ts.ScriptKind.TS
            ).statements
        )
    }
}
