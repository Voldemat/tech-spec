import acorn from 'acorn'
import * as astring from 'astring'
import type { Form, FormFieldSpec, TechSpec, Theme } from '../../spec/types'
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
        specArray: TechSpec[]
    ): TechSpecAst {
        const forms = specArray.filter(
            (spec): spec is Form => spec.type === 'form'
        )
        const themes = specArray.filter(
            (spec): spec is Theme => spec.type === 'theme'
        )
        const techSpecAst: TechSpecAst = {}
        const formsAst = this.genFormsAstFile(forms)
        if (formsAst !== undefined) {
            techSpecAst.form = formsAst
        }
        const themesAst = this.genThemesAstFile(themes)
        if (themesAst !== undefined) {
            techSpecAst.theme = themesAst
        }
        return techSpecAst
    }

    genThemesAstFile (themes: Theme[]): Record<string, any> | undefined {
        const themeAstBody = this.buildThemeAst(themes)
        if (themeAstBody === null) {
            return undefined
        }
        return this.baseAstFactory.buildProgram([themeAstBody])
    }

    buildThemeAst (themes: Theme[]): Record<string, any> | null {
        if (themes.length < 1) return null
        return this.baseAstFactory.buildExportDeclaration(
            this.baseAstFactory.buildVariable(
                'const',
                'design',
                this.baseAstFactory.buildObjectExpression(
                    [this.buildThemeProperties(themes)]
                )
            )
        )
    }

    private buildThemeColorsObject (
        themes: Theme[]
    ): Record<string, Record<string, string>> {
        return Object.keys(themes[0].spec.colors).reduce<
            Record<string, Record<string, string>>
        >(
            (obj, color) => {
                obj[color] = this.buildThemeColorObject(color, themes)
                return obj
            },
            {}
        )
    }

    buildThemeProperties (themes: Theme[]): Record<string, any> {
        const colorsObject = this.buildThemeColorsObject(themes)
        return this.baseAstFactory.buildProperty(
            'colors',
            this.baseAstFactory.buildObjectExpression(
                Object.keys(colorsObject).map(color => {
                    return this.baseAstFactory.buildProperty(
                        color,
                        this.baseAstFactory.buildObjectExpression(
                            getEntries(colorsObject[color])
                                .map(([key, value]) => {
                                    return this.baseAstFactory.buildProperty(
                                        key,
                                        {
                                            type: 'Literal',
                                            value
                                        }
                                    )
                                })
                        )
                    )
                })
            )
        )
    }

    buildThemeColorObject (
        color: string, themes: Theme[]
    ): Record<string, string> {
        return themes.reduce<Record<string, string>>((kObj, theme) => {
            kObj[theme.metadata.name] = theme.spec.colors[color]
            return kObj
        }, {})
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
                    return this.baseAstFactory.buildProperty(
                        fieldKey,
                        {
                            type: 'Literal',
                            value: field[fieldKey]
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
