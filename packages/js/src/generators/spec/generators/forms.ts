import ts, { isStringLiteral } from 'typescript'
import type { Form } from '../../../spec/types'
import { BaseSpecGenerator } from './base'
import { type FormFieldSpec, type FormSpec } from '../../../spec/types/forms'
import { type FormFieldAst, formFieldPropertyNames } from './types'
import { isBoolean, isNumericOrNull, isStringOrNull } from '../utils'

export class FormsSpecGenerator extends BaseSpecGenerator<Form> {
    getSpec (nodes: ts.Node[]): Form[] {
        return nodes
            .map(node => this.extractNameAndValueFromVariable(node))
            .filter((form): form is [string, ts.ObjectLiteralExpression] => (
                form !== null
            ))
            .map(([formName, formValue]) => this.genForm(formName, formValue))
    }

    protected codeNameToSpecName (codeName: string): string {
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
            maxLength: this.extractIntOrNull(ast.maxLength)
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
            (pName === 'type' && ts.isStringLiteral(pValue)) ||
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
}
