import ts from 'typescript'
import type { TechSpec, TechSpecContainer } from '../../../spec/types'
import { FormsSpecGenerator } from './forms'
import { TypesSpecGenerator } from './types-gen'

export class SpecGenerator {
    private readonly forms: FormsSpecGenerator
    private readonly types: TypesSpecGenerator
    constructor () {
        this.forms = new FormsSpecGenerator()
        this.types = new TypesSpecGenerator()
    }

    fromCode (
        code: Partial<Record<TechSpec['type'], string>>
    ): TechSpecContainer {
        return {
            forms: this.forms.getSpec(this.extractNodesFromCode(code.form)),
            designSystems: [],
            features: [],
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