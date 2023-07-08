import type { Form, FormFieldSpec, TechSpec } from '../../spec/types'

function buildFormFieldAst (
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
function buildFormAst (
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
                            ([name, field]) => buildFormFieldAst(name, field)
                        )
                    }
                }
            ]
        }
    }
}
export function generateJSAstForm (form: Form): Record<string, any> {
    const formFields = Object.keys(form.spec)
    const fieldsEntries = formFields.map(
        (fieldName): [string, FormFieldSpec] => {
            return [fieldName, form.spec[fieldName]]
        }
    )
    return buildFormAst(form.metadata.name, fieldsEntries)
}
export function generateJSAstTreeFromSpecArray (
    specArray: TechSpec[]
): Record<string, any> {
    return {
        type: 'Program',
        body: specArray.map(generateJSAstForm),
        sourceType: 'module'
    }
}
