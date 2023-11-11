import ts from 'typescript'
import type { TechSpec } from '../../spec/types'

export abstract class BaseCodeGenerator<T extends TechSpec> {
    abstract genCode (items: T[]): ts.Node[]
    buildVariable (
        name: string, value: ts.Expression, isExported: boolean = false
    ): ts.VariableStatement {
        const modifiers: ts.ModifierLike[] = []
        if (isExported) {
            modifiers.push(ts.factory.createToken(ts.SyntaxKind.ExportKeyword))
        }
        return ts.factory.createVariableStatement(
            modifiers,
            ts.factory.createVariableDeclarationList(
                [
                    ts.factory.createVariableDeclaration(
                        name,
                        undefined,
                        undefined,
                        value
                    )
                ],
                ts.NodeFlags.Const
            )
        )
    }

    buildAsConst (value: ts.Expression): ts.Expression {
        return ts.factory.createAsExpression(
            value,
            ts.factory.createTypeReferenceNode(
                ts.factory.createIdentifier('const'),
                undefined
            )
        )
    }

    buildObject (
        properties: ts.PropertyAssignment[],
        multiline: boolean = true
    ): ts.ObjectLiteralExpression {
        return ts.factory.createObjectLiteralExpression(properties, multiline)
    }

    buildProperty (name: string, value: ts.Expression): ts.PropertyAssignment {
        return ts.factory.createPropertyAssignment(
            ts.factory.createIdentifier(name),
            value
        )
    }

    buildStringProperties (
        items: Array<[string, ts.Expression]>
    ): ts.PropertyAssignment[] {
        return items.map(([key, value]) => this.buildProperty(key, value))
    }

    buildBoolean (value: boolean): ts.BooleanLiteral {
        return value ? ts.factory.createTrue() : ts.factory.createFalse()
    }

    buildStringOrNull (
        value: string | null
    ): ts.StringLiteral | ts.NullLiteral {
        return value !== null
            ? this.buildString(value)
            : ts.factory.createNull()
    }

    buildString (value: string): ts.StringLiteral {
        return ts.factory.createStringLiteral(value)
    }

    buildNumber (value: number): ts.NumericLiteral {
        return ts.factory.createNumericLiteral(value)
    }

    buildNumberOrNull (
        value: number | null
    ): ts.NumericLiteral | ts.NullLiteral {
        return value !== null
            ? this.buildNumber(value)
            : ts.factory.createNull()
    }

    buildImportStatement (
        imports: string[], from: string
    ): ts.ImportDeclaration {
        return ts.factory.createImportDeclaration(
            undefined,
            ts.factory.createImportClause(
                false,
                undefined,
                ts.factory.createNamedImports(
                    imports.map(name => (
                        ts.factory.createImportSpecifier(
                            false,
                            undefined,
                            ts.factory.createIdentifier(name)
                        )
                    ))
                )
            ),
            ts.factory.createStringLiteral(from),
            undefined
        )
    }

    buildArray (items: ts.Expression[]): ts.ArrayLiteralExpression {
        return ts.factory.createArrayLiteralExpression(items)
    }

    buildStringArray (items: string[]): ts.ArrayLiteralExpression {
        return this.buildArray(items.map(this.buildString))
    }

    buildStringArrayOrNull (
        items: string[] | null
    ): ts.ArrayLiteralExpression | ts.NullLiteral {
        return items === null
            ? ts.factory.createNull()
            : this.buildStringArray(items)
    }
}
