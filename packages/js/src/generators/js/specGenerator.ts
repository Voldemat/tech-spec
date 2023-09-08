import type {
    DesignSystem,
    Feature,
    Form,
    TechSpecContainer
} from '../../spec/types'
import type { FeatureFieldSpec } from '../../spec/types/feature'
import type { FormFieldSpec } from '../../spec/types/forms'
import type { TechSpecAst } from '../types'

export class CodeToSpecGenerator {
    fromAst (ast: TechSpecAst): TechSpecContainer {
        return {
            designSystems: this.getDesignSystems(ast.DesignSystem),
            forms: this.getForms(ast.form),
            features: this.getFeatures(ast.feature)
        }
    }

    getForms (ast?: Record<string, any>): Form[] {
        if (ast === undefined) return []
        return ast.body.map(
            (decl: Record<string, any>) => (
                this.genForm(decl.declaration.declarations[0])
            )
        )
    }

    getDesignSystems (ast?: Record<string, any>): DesignSystem[] {
        if (ast === undefined) return []
        return ast.body[0].declaration.declarations.map(
            (system: Record<string, any>) => {
                return this.genDesignSystem(system)
            }
        )
    }

    getFeatures (ast?: Record<string, any>): Feature[] {
        if (ast === undefined) return []
        return ast.body
            .map((d: any) => d.declaration.declarations[0])
            .map((d: any): Feature => {
                const featureName: string = d.id.name.slice(0, -7)
                const fields: Record<string, FeatureFieldSpec> = {}
                d.init.properties.forEach((p: any) => {
                    fields[p.key.name as string] = this.genFeatureFieldSpec(
                        p.value.properties
                    )
                })
                return {
                    type: 'feature',
                    metadata: {
                        name: featureName
                    },
                    spec: fields
                }
            })
    }

    genFeatureFieldSpec (
        properties: Array<Record<string, any>>
    ): FeatureFieldSpec {
        const typeProperty = properties.find(p => p.key.name === 'type')
        const valueProperty = properties.find(p => p.key.name === 'value')
        if (typeProperty === undefined || valueProperty === undefined) {
            throw new Error('typeProperty or valueProperty is not defined')
        }
        let value: string | number
        if (valueProperty.value.type === 'NewExpression') {
            value = valueProperty.value.arguments[0].value
        } else {
            value = valueProperty.value.value
        }
        return {
            type: typeProperty.value.value,
            value: value as any
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
        return [ast.key.name, value]
    }

    /* eslint-disable max-lines-per-function */
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
                } else if (property.value.type === 'NewExpression') {
                    return [
                        property.key.name, property.value.arguments[0].value
                    ]
                } else if (property.value.type === 'ArrayExpression') {
                    return [
                        property.key.name,
                        property.value.elements.map((el: any) => el.value)
                    ]
                } else {
                    throw new Error(
                        'Unhandled property value type: ' +
                        String(property.value.type)
                    )
                }
            })
        )
    }
    /* eslint-enable max-lines-per-function */

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
