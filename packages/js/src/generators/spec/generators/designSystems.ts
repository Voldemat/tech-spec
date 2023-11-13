import ts from 'typescript'
import { type DesignSystem } from '../../../spec/types'
import { BaseSpecGenerator } from './base'
import { type DesignSystemSpec } from '../../../spec/types/designSystem'

export class DesignSystemsSpecGenerator extends (
    BaseSpecGenerator<DesignSystem>
) {
    getSpec (nodes: ts.Node[]): DesignSystem[] {
        return nodes
            .map(node => this.extractNameAndValueFromVariable(node))
            .filter(
                (node): node is [string, ts.ObjectLiteralExpression] => (
                    node !== null
                )
            )
            .map(([name, value]) => this.buildDesignSystem(name, value))
    }

    protected codeNameToSpecName (codeName: string): string {
        return codeName.slice(0, 'DesignSystem'.length)
    }

    private buildDesignSystem (
        name: string,
        value: ts.ObjectLiteralExpression
    ): DesignSystem {
        const spec = this.buildDesignSystemSpec(value)
        if (typeof spec === 'string') {
            throw new Error(
                `DesignSystem:${name}: ${this.buildFieldErrorMessage(spec)}`
            )
        }
        return {
            type: 'DesignSystem',
            metadata: { name },
            spec
        }
    }

    private buildDesignSystemSpec (
        value: ts.ObjectLiteralExpression
    ): DesignSystemSpec | string {
        const colorsNode = this.extractKeyFromProperties<
            ts.ObjectLiteralExpression
        >(
            this.filterObjectProperties(value.properties),
            'colors',
            ts.SyntaxKind.ObjectLiteralExpression
        )
        if (colorsNode === null) return 'colors'
        const properties = this.filterObjectProperties(colorsNode.properties)
            .filter((p): p is [string, ts.ObjectLiteralExpression] => (
                ts.isObjectLiteralExpression(p[1])
            ))
        const colors: DesignSystemSpec['colors'] = {}
        let themes: string[] | null = null
        for (const [pName, pValue] of properties) {
            const field = this.buildDesignSystemSpecField(pValue)
            if (field === null) return 'colors.' + pName
            if (themes === null) themes = Object.keys(field)
            colors[pName] = field
        }
        return { colors }
    }

    private buildDesignSystemSpecField (
        value: ts.ObjectLiteralExpression
    ): Record<string, string> {
        return Object.fromEntries(
            this.filterObjectProperties(value.properties)
                .filter((p): p is [string, ts.StringLiteral] => (
                    ts.isStringLiteral(p[1])
                ))
                .map(([key, node]) => [key, node.text])
        )
    }
}
