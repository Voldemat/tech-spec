import type {
    DesignSystem,
    Form,
    FormFieldSpec,
    TechSpecContainer
} from '../../spec/types'
import type { TechSpecAst } from '../types'

export class CodeToSpecGenerator {
    fromAst (ast: TechSpecAst): TechSpecContainer {
        const forms: Form[] = []
        if (ast.form !== undefined) {
            forms.push(...ast.form.body[0].declaration.declarations.map(
                (form: Record<string, any>) => this.genForm(form)
            ))
        }
        const designSystems: DesignSystem[] = []
        if (ast.DesignSystem !== undefined) {
            designSystems.push(
                ...ast.DesignSystem.body[0].declaration.declarations.map(
                    (system: Record<string, any>) => {
                        return this.genDesignSystem(system)
                    }
                )
            )
        }
        return {
            designSystems,
            forms
        }
    }

    genForm (ast: Record<string, any>): Form {
        const formName: string = ast.id.name.slice(0, -4)
        const fields: Record<string, FormFieldSpec> = Object.fromEntries(
            ast.init.properties.map((field: any) => {
                return this.genFormField(field)
            })
        )
        return {
            type: 'form',
            metadata: {
                name: formName
            },
            spec: fields
        }
    }

    genFormField (ast: Record<string, any>): [string, FormFieldSpec] {
        const value = this.genObject(ast) as FormFieldSpec
        value.field = {
            type: 'field',
            metadata: {
                name: value.fieldRef
            },
            spec: value.field as any
        }
        return [ast.key.name, value]
    }

    genObject (ast: Record<string, any>): Record<string, any> {
        return Object.fromEntries(
            ast.value.properties.map((property: any) => {
                if (property.value.type === 'Literal') {
                    return [
                        // eslint-disable-next-line
                        property.key.name || property.key.value,
                        property.value.value
                    ]
                } else if (property.value.type === 'ObjectExpression') {
                    return [property.key.name, this.genObject(property)]
                } else {
                    throw new Error(
                        'Unhandled property value type: ' +
                        String(property.value.type)
                    )
                }
            })
        )
    }

    genDesignSystem (ast: Record<string, any>): DesignSystem {
        return {
            type: 'DesignSystem',
            metadata: {
                name: ast.id.name
            },
            spec: {
                colors: this.genObject(ast.init.properties[0])
            }
        }
    }
}
