import ts from 'typescript'

export function isNumericOrNull (kind: ts.SyntaxKind): boolean {
    return (
        kind === ts.SyntaxKind.NumericLiteral ||
        kind === ts.SyntaxKind.NullKeyword
    )
}

export function isStringOrNull (kind: ts.SyntaxKind): boolean {
    return (
        kind === ts.SyntaxKind.StringLiteral ||
        kind === ts.SyntaxKind.NullKeyword
    )
}

export function isString (kind: ts.SyntaxKind): boolean {
    return kind === ts.SyntaxKind.StringLiteral
}

export function isBoolean (kind: ts.SyntaxKind): boolean {
    return (
        kind === ts.SyntaxKind.TrueKeyword ||
        kind === ts.SyntaxKind.FalseKeyword
    )
}
