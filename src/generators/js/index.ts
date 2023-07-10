import acorn from 'acorn'
import astring from 'astring'
import type { Form, FormFieldSpec, TechSpec } from '../../spec/types'
import { getEntries } from '../../utils'
import type { SpecCode, TechSpecAst } from '../types'

export class AstFactory {
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
            const finalAst = this.nestedOmit(
                codeAst,
                [
                    'specifiers',
                    'source',
                    'sourceType',
                    'start',
                    'end',
                    'method',
                    'shorthand',
                    'computed',
                    'raw'
                ]
            )
            specAst[type] = finalAst
        })
        return specAst as TechSpecAst
    }

    nestedOmit (
        obj: Record<string, any>, omitKeys: string[]
    ): Record<string, any> {
        const newObj: Record<string, any> = {}
        Object.entries(obj).forEach(([key, value]: [string, any]) => {
            if (omitKeys.includes(key)) {
                return
            }
            if (value instanceof Array) {
                newObj[key] = value.map((v) => this.nestedOmit(v, omitKeys))
            } else if (value instanceof Object) {
                newObj[key] = this.nestedOmit(value, omitKeys)
            } else {
                newObj[key] = value
            }
        })
        return newObj
    }

    fromSpec (
        specArray: TechSpec[]
    ): TechSpecAst {
        const forms = specArray.filter(spec => spec.type === 'form')
        return {
            form: this.genFormsAstFile(forms)
        }
    }

    genFormsAstFile (forms: Form[]): Record<string, any> {
        return {
            type: 'Program',
            body: forms.map(this.genFormAst),
            sourceType: 'module'
        }
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
        return {
            type: 'ExportNamedDeclaration',
            declaration: {
                type: 'VariableDeclaration',
                kind: 'const',
                declarations: [
                    {
                        type: 'VariableDeclarator',
                        id: {
                            type: 'Identifier',
                            name: formName + 'Form'
                        },
                        init: {
                            type: 'ObjectExpression',
                            properties: fields.map(
                                ([name, field]) => (
                                    this.buildFormFieldAst(name, field)
                                )
                            )
                        }
                    }
                ]
            }
        }
    }

    buildFormFieldAst (
        name: string, field: FormFieldSpec
    ): Record<string, any> {
        const fieldKeys = Object.keys(field) as Array<(keyof FormFieldSpec)>
        return {
            type: 'Property',
            key: {
                type: 'Identifier',
                name
            },
            kind: 'init',
            value: {
                type: 'ObjectExpression',
                properties: fieldKeys.map(fieldKey => ({
                    type: 'Property',
                    key: {
                        type: 'Identifier',
                        name: fieldKey
                    },
                    value: {
                        type: 'Literal',
                        value: field[fieldKey]
                    },
                    kind: 'init'
                }))
            }
        }
    }
}
export class CodeFactory {
    generate (ast: TechSpecAst): SpecCode {
        return getEntries(ast)
            .reduce<Partial<SpecCode>>(
                (obj, [type, ast]) => {
                    obj[type] = astring.generate(ast as astring.Node)
                    return obj
                },
                {}
            ) as SpecCode
    }
}
