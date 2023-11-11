import ts from 'typescript'
import type { Form, TechSpec, TechSpecContainer } from '../spec/types'
import type { FormFieldSpec, FormSpec } from '../spec/types/forms'

interface FormFieldAst {
    type: ts.StringLiteral
    required: ts.BooleanLiteral
    maxLength: ts.NumericLiteral | ts.NullLiteral
    placeholder: ts.StringLiteral | ts.NullLiteral
    errorMessage: ts.StringLiteral | ts.NullLiteral
    helperMessage: ts.StringLiteral | ts.NullLiteral
}

function isNumericOrNull (kind: ts.SyntaxKind): boolean {
    return (
        kind === ts.SyntaxKind.NumericLiteral ||
        kind === ts.SyntaxKind.NullKeyword
    )
}

function isStringOrNull (kind: ts.SyntaxKind): boolean {
    return (
        kind === ts.SyntaxKind.StringLiteral ||
        kind === ts.SyntaxKind.NullKeyword
    )
}

function isString (kind: ts.SyntaxKind): boolean {
    return kind === ts.SyntaxKind.StringLiteral
}

function isBoolean (kind: ts.SyntaxKind): boolean {
    return (
        kind === ts.SyntaxKind.TrueKeyword ||
        kind === ts.SyntaxKind.FalseKeyword
    )
}

const formFieldPropertyNames: Array<keyof FormFieldSpec> = [
    'type',
    'errorMessage',
    'helperMessage',
    'placeholder',
    'required',
    'maxLength'
]
export class SpecGenerator {
    fromCode (
        code: Partial<Record<TechSpec['type'], string>>
    ): TechSpecContainer {
        return {
            forms: this.getForms(code.form),
            designSystems: [],
            features: [],
            types: []
        }
    }

    private extractNodesFromCode (code: string | undefined): ts.Node[] {
        if (code === undefined) return []
        return Array.from(
            ts.createSourceFile(
                '',
                code,
                ts.ScriptTarget.Latest,
                false,
                ts.ScriptKind.TS
            ).statements
        )
    }

    private getForms (code: string | undefined): Form[] {
        if (code === undefined) return []
        return this.extractNodesFromCode(code)
            .map(node => this.mapNodeToFormNameAndValue(node))
            .filter((form): form is [string, ts.ObjectLiteralExpression] => (
                form !== null
            ))
            .map(([formName, formValue]) => this.genForm(formName, formValue))
    }

    private mapNodeToFormNameAndValue (
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
        const formName = declaration.name.text
        if (
            declaration.initializer?.kind !==
            ts.SyntaxKind.AsExpression &&
            (declaration.initializer as ts.AsExpression).expression.kind !==
            ts.SyntaxKind.ObjectLiteralExpression
        ) return null
        const formValue = (
            (declaration.initializer as ts.AsExpression).expression
        ) as ts.ObjectLiteralExpression
        return [this.extractFormNameFromCode(formName), formValue]
    }

    private extractFormNameFromCode (codeName: string): string {
        return codeName.slice(0, codeName.length - 4)
    }

    private genForm (
        formName: string, expression: ts.ObjectLiteralExpression
    ): Form {
        const spec: FormSpec = {}
        expression.properties.forEach(p => {
            if (
                p.kind !== ts.SyntaxKind.PropertyAssignment ||
                p.name.kind !== ts.SyntaxKind.Identifier ||
                p.initializer.kind !== ts.SyntaxKind.ObjectLiteralExpression
            ) return
            const fieldName = p.name.text
            const initializer = p.initializer as ts.ObjectLiteralExpression
            spec[fieldName] = this.buildFormFieldSpec(
                this.buildFormFieldAst(initializer.properties)
            )
        })
        return {
            type: 'form',
            metadata: {
                name: formName
            },
            spec
        }
    }

    private buildFormFieldSpec (ast: FormFieldAst): FormFieldSpec {
        return {
            type: ast.type.text,
            errorMessage: this.extractStringOrNull(ast.errorMessage),
            helperMessage: this.extractStringOrNull(ast.helperMessage),
            placeholder: this.extractStringOrNull(ast.placeholder),
            required: this.extractBoolean(ast.required),
            maxLength: this.extractNumberOrNull(ast.maxLength)
        }
    }

    private buildFormFieldAst (
        properties: ts.NodeArray<ts.ObjectLiteralElementLike>
    ): FormFieldAst {
        const ast: Partial<FormFieldAst> = {}
        properties
            .map((p): [keyof FormFieldAst, ts.Expression] | null => {
                if (
                    p.kind !== ts.SyntaxKind.PropertyAssignment ||
                    p.name.kind !== ts.SyntaxKind.Identifier
                ) return null
                const formFieldName = p.name.text
                if (
                    !formFieldPropertyNames.includes(formFieldName as any)
                ) return null
                return [formFieldName as keyof FormFieldAst, p.initializer]
            })
            .filter((p): p is [keyof FormFieldAst, ts.Expression] => p !== null)
            .forEach(([pName, pValue]) => (
                ast[pName] = this.buildFormFieldAstProperty(
                    pName, pValue
                ) as any
            ))
        return ast as FormFieldAst
    }

    private buildFormFieldAstProperty (
        pName: keyof FormFieldAst,
        pValue: ts.Expression
    ): ts.Expression {
        if (
            this.isFormFieldPropertyValid(pName, pValue)
        ) return pValue
        const isKnownField = formFieldPropertyNames.includes(pName)
        if (isKnownField) {
            throw new Error(
                `Invalid type ${ts.SyntaxKind[pValue.kind]} for field ${pName}`
            )
        }
        throw new Error(`Unknown field: ${pName}`)
    }

    private isFormFieldPropertyValid (
        pName: keyof FormFieldSpec, pValue: ts.Expression
    ): boolean {
        return (
            (pName === 'type' && isString(pValue.kind)) ||
            (pName === 'required' && isBoolean(pValue.kind)) ||
            (
                [
                    'helperMessage',
                    'errorMessage',
                    'placeholder'
                ].includes(pName) &&
                isStringOrNull(pValue.kind)
            ) ||
            (pName === 'maxLength' && isNumericOrNull(pValue.kind))
        )
    }

    private extractStringOrNull (
        node: ts.StringLiteral | ts.NullLiteral
    ): string | null {
        switch (node.kind) {
        case ts.SyntaxKind.StringLiteral: return node.text
        case ts.SyntaxKind.NullKeyword: return null
        }
    }

    private extractBoolean (node: ts.BooleanLiteral): boolean {
        switch (node.kind) {
        case ts.SyntaxKind.FalseKeyword: return false
        case ts.SyntaxKind.TrueKeyword: return true
        }
    }

    private extractNumberOrNull (
        node: ts.NumericLiteral | ts.NullLiteral
    ): number | null {
        switch (node.kind) {
        case ts.SyntaxKind.NumericLiteral: return parseInt(node.text, 10)
        case ts.SyntaxKind.NullKeyword: return null
        }
    }
}
