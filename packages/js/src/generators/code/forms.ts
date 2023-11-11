import ts from 'typescript'
import type { Form } from '../../spec/types'
import type { FormFieldSpec } from '../../spec/types/forms'
import { getEntries } from '../../utils'
import { BaseCodeGenerator } from './base'
import type { TypesCodeGenerator } from './types'

export class FormsCodeGenerator extends BaseCodeGenerator<Form> {
    constructor (private readonly types: TypesCodeGenerator) { super() }

    genCode (forms: Form[]): ts.Node[] {
        const types: string[] = []
        const nodes = forms.map(form => {
            return this.buildVariable(
                this.getFormCodeName(form.metadata.name),
                this.buildAsConst(
                    this.buildObject(
                        getEntries(form.spec).map(([key, value]) => {
                            const typeName = this.types.genTypeCodeName(
                                value.type
                            )
                            if (!types.includes(typeName)) types.push(typeName)
                            return this.genFormProperty(key, value)
                        })
                    )
                ), true
            )
        })
        return [
            this.buildImportStatement(types, './types'),
            ...nodes
        ]
    }

    getFormCodeName (formName: string): string {
        return formName + 'Form'
    }

    private genFormProperty (
        name: string, value: FormFieldSpec
    ): ts.PropertyAssignment {
        return this.buildProperty(
            name,
            ts.factory.createObjectLiteralExpression(
                this.genFormFieldProperties(value)
                    .map(([key, value]) => {
                        return this.buildProperty(key, value)
                    }),
                true
            )
        )
    }

    private genFormFieldProperties (
        field: FormFieldSpec
    ): Array<[string, ts.Expression]> {
        return [
            ['type', ts.factory.createStringLiteral(field.type)],
            ['required', this.buildBoolean(field.required)],
            ['errorMessage', this.buildStringOrNull(field.errorMessage)],
            ['placeholder', this.buildStringOrNull(field.placeholder)],
            ['helperMessage', this.buildStringOrNull(field.helperMessage)],
            ['maxLength', this.buildNumberOrNull(field.maxLength)],
            [
                'typeSpec',
                ts.factory.createIdentifier(
                    this.types.genTypeCodeName(field.type)
                )
            ]
        ]
    }
}
