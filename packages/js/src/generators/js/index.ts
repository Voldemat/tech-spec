import acorn from 'acorn'
import type {
    DesignSystem,
    Feature,
    TechSpecContainer
} from '../../spec/types'
import type { DesignSystemSpec } from '../../spec/types/designSystem'
import type { FeatureFieldSpec } from '../../spec/types/feature'
import type { SpecCode, TechSpecAst } from '../types'
import type { BaseAstFactory } from './base'
import { FormAstFactory } from './formAstFactory'
import { nestedOmit } from './utils'

export class AstFactory {
    private readonly formAstFactory: FormAstFactory
    constructor (
        private readonly baseAstFactory: BaseAstFactory
    ) {
        this.formAstFactory = new FormAstFactory(baseAstFactory)
    }

    fromCode (specCode: SpecCode): TechSpecAst {
        const specAst: Partial<TechSpecAst> = {}
        const specCodeEntries = (
            Object.entries(specCode) as Array<[keyof SpecCode, string]>
        )
        specCodeEntries.forEach(([type, code]) => {
            const codeAst: Record<string, any> = acorn.parse(
                code,
                { ecmaVersion: 2022, ranges: false, sourceType: 'module' }
            )
            const finalAst = nestedOmit(
                codeAst,
                ['specifiers', 'source', 'start', 'end', 'raw']
            )
            specAst[type] = finalAst
        })
        return specAst as TechSpecAst
    }

    fromSpec (
        spec: TechSpecContainer
    ): TechSpecAst {
        const techSpecAst: TechSpecAst = {}
        const formsAst = this.formAstFactory.genFormsAstFile(spec.forms)
        if (formsAst !== undefined) {
            techSpecAst.form = formsAst
        }
        const designSystemsAst = this.genDesignSystemAstFile(spec.designSystems)
        if (designSystemsAst !== undefined) {
            techSpecAst.DesignSystem = designSystemsAst
        }
        const featuresAst = this.genFeaturesAstFile(spec.features)
        if (featuresAst !== undefined) {
            techSpecAst.feature = featuresAst
        }
        return techSpecAst
    }

    genDesignSystemAstFile (
        designSystems: DesignSystem[]
    ): Record<string, any> | undefined {
        const designSystemAstBody = this.buildDesignSystemsAst(designSystems)
        if (designSystemAstBody === null) {
            return undefined
        }
        return this.baseAstFactory.buildProgram(designSystemAstBody)
    }

    buildDesignSystemsAst (
        designSystems: DesignSystem[]
    ): Array<Record<string, any>> | null {
        if (designSystems.length < 1) return null
        return designSystems.map(system => {
            return this.baseAstFactory.buildExportDeclaration(
                this.baseAstFactory.buildVariable(
                    'const',
                    system.metadata.name,
                    this.baseAstFactory.buildObjectExpression(
                        [this.buildDesignProperties(system.spec)]
                    )
                )
            )
        })
    }

    buildDesignProperties (systemSpec: DesignSystemSpec): Record<string, any> {
        return this.baseAstFactory.buildProperty(
            'colors',
            this.buildColorsObject(systemSpec.colors)
        )
    }

    buildColorsObject (
        colors: Record<string, Record<string, string>>
    ): Record<string, any> {
        const obj = this.baseAstFactory.buildObjectExpression(
            Object.entries(colors).map(([key, value]) => {
                return this.baseAstFactory.buildProperty(
                    key,
                    this.buildColorObject(value)
                )
            })
        )
        return obj
    }

    buildColorObject (color: Record<string, string>): Record<string, any> {
        return this.baseAstFactory.buildObjectExpression(
            Object.entries(color).map(([key, value]) => {
                return this.baseAstFactory.buildProperty(
                    key,
                    {
                        type: 'Literal',
                        value
                    }
                )
            })
        )
    }

    genFeaturesAstFile (features: Feature[]): Record<string, any> | undefined {
        if (features.length === 0) return undefined
        return this.baseAstFactory.buildProgram(
            features.map(feature => this.genFeatureAst(feature))
        )
    }

    genFeatureAst (feature: Feature): Record<string, any> {
        const fields: Array<[string, FeatureFieldSpec]> = Object.entries(
            feature.spec
        )
        return this.baseAstFactory.buildExportDeclaration(
            this.baseAstFactory.buildVariable(
                'const',
                // eslint-disable-next-line
                feature.metadata.name + 'Feature',
                this.baseAstFactory.buildObjectExpression(
                    fields.map(
                        ([name, field]) => (
                            this.buildFeatureFieldAst(name, field)
                        )
                    )
                )
            )
        )
    }

    buildFeatureFieldAst (
        fieldName: string, field: FeatureFieldSpec
    ): Record<string, any> {
        let value: Record<string, any>
        if (field.type === 'date' || field.type === 'date-time') {
            value = this.baseAstFactory.buildNewExpression(
                'Date', [field.value]
            )
        } else if (field.type === 'link') {
            value = this.baseAstFactory.buildNewExpression(
                'URL', [field.value]
            )
        } else {
            value = this.baseAstFactory.buildLiteral(field.value)
        }
        return this.createFeatureFieldAst(fieldName, field.type, value)
    }

    private createFeatureFieldAst (
        fieldName: string,
        type: string,
        value: Record<string, any>
    ): Record<string, any> {
        return this.baseAstFactory.buildProperty(
            fieldName,
            this.baseAstFactory.buildObjectExpression([
                this.baseAstFactory.buildProperty(
                    'type', this.baseAstFactory.buildLiteral(type)
                ),
                this.baseAstFactory.buildProperty(
                    'value',
                    value
                )
            ])
        )
    }
}
