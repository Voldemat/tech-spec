import ts from 'typescript'
import { type TechSpec } from '../../../spec/types'

export abstract class BaseSpecGenerator<T extends TechSpec> {
    abstract getSpec (nodes: ts.Node[]): T[]
    protected abstract codeNameToSpecName (codeName: string): string

    protected extractRegex (node: ts.RegularExpressionLiteral): RegExp {
        return new RegExp(node.text.slice(1, node.text.length - 1))
    }

    protected isNullLiteral (node: ts.Node): node is ts.NullLiteral {
        return node.kind === ts.SyntaxKind.NullKeyword
    }

    protected extractStringArray (node: ts.ArrayLiteralExpression): string[] {
        return node.elements
            .filter((el): el is ts.StringLiteral => ts.isStringLiteral(el))
            .map(el => el.text)
    }

    protected extractStringArrayOrNull (
        node: ts.ArrayLiteralExpression | ts.NullLiteral
    ): string[] | null {
        if (node.kind === ts.SyntaxKind.NullKeyword) return null
        return this.extractStringArray(node)
    }

    protected extractNameAndValueFromVariable (
        node: ts.Node
    ): [string, ts.ObjectLiteralExpression] | null {
        if (node.kind !== ts.SyntaxKind.VariableStatement) return null
        const declarations = (
            (node as ts.VariableStatement).declarationList.declarations
        )
        if (declarations.length !== 1) return null
        const declaration = declarations[0]
        if (
            declaration.name.kind !== ts.SyntaxKind.Identifier
        ) return null
        const codeName = declaration.name.text
        if (
            declaration.initializer?.kind !==
            ts.SyntaxKind.AsExpression &&
            (declaration.initializer as ts.AsExpression).expression.kind !==
            ts.SyntaxKind.ObjectLiteralExpression
        ) return null
        const value = (
            (declaration.initializer as ts.AsExpression).expression
        ) as ts.ObjectLiteralExpression
        return [this.codeNameToSpecName(codeName), value]
    }

    protected extractStringOrNull (
        node: ts.StringLiteral | ts.NullLiteral
    ): string | null {
        switch (node.kind) {
        case ts.SyntaxKind.StringLiteral: return node.text
        case ts.SyntaxKind.NullKeyword: return null
        }
    }

    protected extractBoolean (node: ts.BooleanLiteral): boolean {
        switch (node.kind) {
        case ts.SyntaxKind.FalseKeyword: return false
        case ts.SyntaxKind.TrueKeyword: return true
        }
    }

    protected extractInt (node: ts.NumericLiteral): number {
        return parseInt(node.text, 10)
    }

    protected extractFloat (node: ts.NumericLiteral): number {
        return parseFloat(node.text)
    }

    protected extractIntOrNull (
        node: ts.NumericLiteral | ts.NullLiteral
    ): number | null {
        switch (node.kind) {
        case ts.SyntaxKind.NumericLiteral: return this.extractInt(node)
        case ts.SyntaxKind.NullKeyword: return null
        }
    }

    protected extractFloatOrNull (
        node: ts.NumericLiteral | ts.NullLiteral
    ): number | null {
        switch (node.kind) {
        case ts.SyntaxKind.NumericLiteral: return this.extractFloat(node)
        case ts.SyntaxKind.NullKeyword: return null
        }
    }
}
