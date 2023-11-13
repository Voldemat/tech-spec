import ts from 'typescript'
import type { Feature } from '../../../spec/types'
import { BaseSpecGenerator } from './base'
import type {
    FeatureFieldSpec,
    FeatureNumberFieldSpec,
    FeatureNumberFieldType,
    FeatureSpec,
    FeatureStringFieldSpec,
    FeatureStringFieldType
} from '../../../spec/types/feature'
import { featureSpecTypes } from './types'

export class FeaturesSpecGenerator extends BaseSpecGenerator<Feature> {
    getSpec (nodes: ts.Node[]): Feature[] {
        return nodes
            .map(node => this.extractNameAndValueFromVariable(node))
            .filter((f): f is [string, ts.ObjectLiteralExpression] => (
                f !== null
            ))
            .map(([formName, formValue]) => (
                this.genFeature(formName, formValue)
            ))
    }

    protected codeNameToSpecName (codeName: string): string {
        return codeName.slice(0, codeName.length - 'Feature'.length)
    }

    private genFeature (
        name: string,
        fValue: ts.ObjectLiteralExpression
    ): Feature {
        const spec = this.buildFeatureSpec(fValue)
        if (typeof spec === 'string') {
            throw new Error(
                `feature:${name}: ${this.buildFieldErrorMessage(spec)}`
            )
        }
        return {
            type: 'feature',
            metadata: { name },
            spec
        }
    }

    private buildFeatureSpec (
        value: ts.ObjectLiteralExpression
    ): FeatureSpec | string {
        const properties = this.filterObjectProperties(value.properties)
            .filter((p): p is [string, ts.ObjectLiteralExpression] => (
                ts.isObjectLiteralExpression(p[1])
            ))
        const spec: FeatureSpec = {}
        for (const [fName, fValue] of properties) {
            const fieldSpec = this.buildFeatureFieldSpec(fValue)
            if (typeof fieldSpec === 'string') {
                return fName + '.' + fieldSpec
            }
            spec[fName] = fieldSpec
        }
        return spec
    }

    private buildFeatureFieldSpec (
        value: ts.ObjectLiteralExpression
    ): FeatureFieldSpec | 'type' | 'value' {
        const properties = this.filterObjectProperties(value.properties)
        const typeNode = this.extractKeyFromProperties<ts.StringLiteral>(
            properties,
            'type',
            ts.SyntaxKind.StringLiteral
        )
        if (typeNode === null) return 'type'
        if (!featureSpecTypes.includes(typeNode.text as any)) return 'type'
        const type = typeNode.text as FeatureFieldSpec['type']
        switch (type) {
        case 'uuid':
        case 'link':
        case 'date':
        case 'time':
        case 'date-time':
        case 'duration':
        case 'string': return this.buildStringSpec(type, properties)
        case 'int':
        case 'float':
        case 'uint': return this.buildNumberSpec(type, properties)
        }
    }

    private buildStringSpec (
        type: FeatureStringFieldType,
        properties: Array<[string, ts.Expression]>
    ): FeatureStringFieldSpec | 'value' {
        const node = this.extractKeyFromProperties<ts.StringLiteral>(
            properties,
            'value',
            ts.SyntaxKind.StringLiteral
        )
        if (node === null) return 'value'
        return { type, value: node.text }
    }

    private buildNumberSpec (
        type: FeatureNumberFieldType,
        properties: Array<[string, ts.Expression]>
    ): FeatureNumberFieldSpec | 'value' {
        const node = this.extractKeyFromProperties<ts.NumericLiteral>(
            properties,
            'value',
            ts.SyntaxKind.NumericLiteral
        )
        if (node === null) return 'value'
        switch (type) {
        case 'int':
        case 'uint':
            return {
                type,
                value: this.extractInt(node)
            }
        case 'float':
            return {
                type,
                value: this.extractFloat(node)
            }
        }
    }
}
