import acorn from 'acorn'
import * as astring from 'astring'
import type {
    DesignSystem,
    DesignSystemSpec,
    FieldSpec,
    Form,
    FormFieldSpec,
    TechSpecContainer
} from '../../spec/types'
import { getEntries } from '../../utils'
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

    genFormsAstFile (forms: Form[]): Record<string, any> {
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
                    let value: string | boolean | FieldSpec | null
                    const fieldValue = field[fieldKey]
                    if (fieldValue instanceof Object) {
                        value = fieldValue.spec
                    } else { value = fieldValue }
                    return this.baseAstFactory.buildProperty(
                        fieldKey,
                        {
                            type: 'Literal',
                            value
                        }
                    )
                })
            )
        )
    }
}
export class CodeFactory {
    generate (ast: TechSpecAst): SpecCode {
        return getEntries(ast)
            .filter(
                (entry): entry is [
                    keyof TechSpecAst, Record<string, any>
                ] => {
                    return entry?.[1] !== undefined
                }
            )
            .reduce<SpecCode>(
                (obj, [type, ast]) => {
                    if (ast !== undefined) {
                        obj[type] = astring.generate(ast as astring.Node)
                    }
                    return obj
                },
                {}
            )
    }
}
