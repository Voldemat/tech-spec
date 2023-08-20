import acorn from 'acorn'
import type {
    DesignSystem,
    DesignSystemSpec,
    Feature,
    FeatureFieldSpec,
    Field,
    Form,
    FormFieldSpec,
    TechSpecContainer
} from '../../spec/types'
import type { SpecCode, TechSpecAst } from '../types'
import type { BaseAstFactory } from './base'
import { nestedOmit } from './utils'

export class AstFactory {
    constructor (private readonly baseAstFactory: BaseAstFactory) {}
    fromCode (specCode: SpecCode): TechSpecAst {
        const specAst: Partial<TechSpecAst> = {}
        const specCodeEntries = (
            Object.entries(specCode) as Array<[keyof SpecCode, string]>
        )
        specCodeEntries.forEach(([type, code]) => {
            const codeAst: Record<string, any> = acorn.parse(
                code,
                { ecmaVersion: 7, ranges: false, sourceType: 'module' }
            )
            const finalAst = nestedOmit(
                codeAst,
                [
                    'specifiers',
                    'source',
                    'start',
                    'end',
                    'raw'
                ]
            )
            specAst[type] = finalAst
        })
        return specAst as TechSpecAst
    }

    fromSpec (
        spec: TechSpecContainer
    ): TechSpecAst {
        const techSpecAst: TechSpecAst = {}
        const formsAst = this.genFormsAstFile(spec.forms)
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

    genFeaturesAstFile (features: Feature[]): Record<string, any> {
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

    genFormsAstFile (forms: Form[]): Record<string, any> | undefined {
        if (forms.length === 0) return undefined
        return this.baseAstFactory.buildProgram(
            forms.map(form => this.genFormAst(form))
        )
    }

    genFormAst (form: Form): Record<string, any> {
        const formFields = Object.keys(form.spec)
        const fieldsEntries = formFields.map(
            (fieldName): [string, FormFieldSpec] => {
                return [fieldName, form.spec[fieldName]]
            }
        )
        return this.buildFormAst(form.metadata.name, fieldsEntries)
    }

    buildFormAst (
        formName: string, fields: Array<[string, FormFieldSpec]>
    ): Record<string, any> {
        return this.baseAstFactory.buildExportDeclaration(
            this.baseAstFactory.buildVariable(
                'const',
                formName + 'Form',
                this.baseAstFactory.buildObjectExpression(
                    fields.map(
                        ([name, field]) => (
                            this.buildFormFieldAst(name, field)
                        )
                    )
                )
            )
        )
    }

    buildFormFieldAst (
        name: string, field: FormFieldSpec
    ): Record<string, any> {
        const fieldKeys = Object.keys(field) as Array<(keyof FormFieldSpec)>
        return this.baseAstFactory.buildProperty(
            name,
            this.baseAstFactory.buildObjectExpression(
                fieldKeys.map(fieldKey => {
                    return this.baseAstFactory.buildProperty(
                        fieldKey,
                        this.buildFormFieldValue(field[fieldKey])
                    )
                })
            )
        )
    }

    buildFormFieldValue (value: string | boolean | Field | null): any {
        if (!(value instanceof Object)) return { type: 'Literal', value }
        return this.baseAstFactory.buildObjectExpression([
            this.baseAstFactory.buildProperty(
                'type', this.baseAstFactory.buildLiteral(value.spec.type)
            ),
            this.baseAstFactory.buildProperty(
                'regex', this.baseAstFactory.buildNewExpression(
                    'RegExp', [value.spec.regex]
                ))
        ])
    }
}
