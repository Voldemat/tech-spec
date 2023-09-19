/* eslint-disable max-lines */
import type { Form, FormFieldSpec } from '../../spec/types/forms'
import type {
    DateTimeTypeSpec,
    DateTypeSpec,
    EnumTypeSpec,
    FileSize,
    FileTypeSpec,
    FloatTypeSpec,
    ImageAspectRatio,
    ImageTypeSpec,
    IntTypeSpec,
    StringTypeSpec,
    TimeTypeSpec,
    TypeSpec,
    UnionTypeSpec
} from '../../spec/types/type'
import { type BaseAstFactory } from './base'

export class FormAstFactory {
    constructor (private readonly baseAstFactory: BaseAstFactory) {}
    genFormsAstFile (forms: Form[]): Record<string, any> | undefined {
        if (forms.length === 0) return undefined
        return this.baseAstFactory.buildProgram(
            forms.map(form => this.genFormAst(form))
        )
    }

    genFormAst (form: Form): Record<string, any> {
        const formFields = Object.keys(form.spec)
        const fieldsEntries = formFields.map(
            (fieldName): [string, FormFieldSpec] => {
                return [fieldName, form.spec[fieldName]]
            }
        )
        return this.buildFormAst(form.metadata.name, fieldsEntries)
    }

    buildFormAst (
        formName: string, fields: Array<[string, FormFieldSpec]>
    ): Record<string, any> {
        return this.baseAstFactory.buildExportDeclaration(
            this.baseAstFactory.buildVariable(
                'const',
                formName + 'Form',
                this.baseAstFactory.buildObjectExpression(
                    fields.map(
                        ([name, field]) => (
                            this.buildFormFieldAst(name, field)
                        )
                    )
                )
            )
        )
    }

    buildFormFieldAst (
        name: string, field: FormFieldSpec
    ): Record<string, any> {
        const fieldKeys = Object.keys(field) as Array<(keyof FormFieldSpec)>
        return this.baseAstFactory.buildProperty(
            name,
            this.baseAstFactory.buildObjectExpression(
                fieldKeys.map(fieldKey => {
                    return this.baseAstFactory.buildProperty(
                        fieldKey,
                        this.buildFormFieldValue(field[fieldKey])
                    )
                })
            )
        )
    }

    buildFormFieldValue (
        value: string | boolean | TypeSpec | null | number
    ): any {
        if (!(value instanceof Object)) {
            return this.baseAstFactory.buildLiteral(value)
        }
        return this.buildTypeSpecValue(value)
    }

    /* eslint-disable max-lines-per-function */
    buildTypeSpecValue (value: TypeSpec): Record<string, any> {
        const properties: Array<Record<string, any>> = [
            this.baseAstFactory.buildProperty(
                'type', this.baseAstFactory.buildLiteral(value.type)
            )
        ]
        switch (value.type) {
        case 'string': {
            properties.push(...this.buildStringTypeProperties(value))
            break
        }
        case 'float':
        case 'int': {
            properties.push(...this.buildNumberTypeProperties(value))
            break
        }
        case 'datetime':
        case 'time':
        case 'date': {
            properties.push(...this.buildDateTimeTypeProperties(value))
            break
        }
        case 'image': {
            properties.push(...this.buildImageTypeProperties(value))
            break
        }
        case 'file': {
            properties.push(...this.buildFileTypeProperties(value))
            break
        }
        case 'enum': {
            properties.push(...this.buildEnumTypeProperties(value))
            break
        }
        case 'union': {
            properties.push(...this.buildUnionTypeProperties(value))
            break
        }
        default: {
            throw new Error(`Unhandled type: ${JSON.stringify(value)}`)
        }
        }
        return this.baseAstFactory.buildObjectExpression(properties)
    }
    /* eslint-enable max-lines-per-function */

    buildStringTypeProperties (
        value: StringTypeSpec
    ): Array<Record<string, any>> {
        return [
            this.baseAstFactory.buildProperty(
                'regex', this.baseAstFactory.buildNewExpression(
                    'RegExp', [value.regex]
                )
            )
        ]
    }

    buildNumberTypeProperties (
        value: IntTypeSpec | FloatTypeSpec
    ): Array<Record<string, any>> {
        return [
            this.baseAstFactory.buildPropertyWithLiteral(
                'max', value.max
            ),
            this.baseAstFactory.buildPropertyWithLiteral(
                'min', value.min
            )
        ]
    }

    buildDateTimeTypeProperties (
        value: DateTypeSpec | TimeTypeSpec | DateTimeTypeSpec
    ): Array<Record<string, any>> {
        return [
            this.baseAstFactory.buildPropertyWithLiteral(
                'allowOnly', value.allowOnly
            )
        ]
    }

    /* eslint-disable max-lines-per-function */
    buildImageTypeProperties (
        value: ImageTypeSpec
    ): Array<Record<string, any>> {
        return [
            this.baseAstFactory.buildProperty(
                'minSize', this.buildFileSizeAstValue(value.minSize)
            ),
            this.baseAstFactory.buildProperty(
                'maxSize', this.buildFileSizeAstValue(value.maxSize)
            ),
            this.baseAstFactory.buildPropertyWithLiteral(
                'minWidth', value.minWidth
            ),
            this.baseAstFactory.buildPropertyWithLiteral(
                'minHeight', value.minHeight
            ),
            this.baseAstFactory.buildPropertyWithLiteral(
                'maxWidth', value.maxWidth
            ),
            this.baseAstFactory.buildPropertyWithLiteral(
                'maxHeight', value.maxHeight
            ),
            this.baseAstFactory.buildProperty(
                'aspectRatio', this.baseAspectRationAstValue(value.aspectRatio)
            ),
            this.baseAstFactory.buildPropertyWithLiteral(
                'allowedTypes',
                value.allowedTypes
            )
        ]
    }
    /* eslint-enable max-lines-per-function */

    buildFileSizeAstValue (size: FileSize | null): Record<string, any> {
        if (size === null) return this.baseAstFactory.buildLiteral(size)
        return this.baseAstFactory.buildObjectExpression([
            this.baseAstFactory.buildPropertyWithLiteral(
                'unit', size.unit
            ),
            this.baseAstFactory.buildPropertyWithLiteral(
                'value', size.value
            )
        ])
    }

    baseAspectRationAstValue (
        aspectRatio: ImageAspectRatio | null
    ): Record<string, any> {
        if (aspectRatio === null) {
            return this.baseAstFactory.buildLiteral(aspectRatio)
        }
        return this.baseAstFactory.buildObjectExpression([
            this.baseAstFactory.buildPropertyWithLiteral(
                'width', aspectRatio.width
            ),
            this.baseAstFactory.buildPropertyWithLiteral(
                'height', aspectRatio.height
            )
        ])
    }

    buildFileTypeProperties (value: FileTypeSpec): Array<Record<string, any>> {
        return [
            this.baseAstFactory.buildProperty(
                'minSize', this.buildFileSizeAstValue(value.minSize)
            ),
            this.baseAstFactory.buildProperty(
                'maxSize', this.buildFileSizeAstValue(value.maxSize)
            ),
            this.baseAstFactory.buildPropertyWithLiteral(
                'allowedMimeTypes', value.allowedMimeTypes
            )
        ]
    }

    buildEnumTypeProperties (
        value: EnumTypeSpec
    ): Array<Record<string, any>> {
        return [
            this.baseAstFactory.buildPropertyWithLiteral(
                'itemType', value.itemType
            ),
            this.baseAstFactory.buildPropertyWithLiteral(
                'items', value.items
            ),
            this.baseAstFactory.buildProperty(
                'itemTypeSpec', this.buildTypeSpecValue(value.itemTypeSpec)
            )
        ]
    }

    buildUnionTypeProperties (
        value: UnionTypeSpec
    ): Array<Record<string, any>> {
        return [
            this.baseAstFactory.buildPropertyWithLiteral(
                'types', value.types
            ),
            this.baseAstFactory.buildProperty(
                'typeSpecs',
                this.baseAstFactory.buildObjectExpression(
                    Object.entries(value.typeSpecs)
                        .map(([name, tSpec]) => (
                            this.baseAstFactory.buildProperty(
                                name,
                                this.buildTypeSpecValue(tSpec)
                            )
                        ))
                )
            )
        ]
    }
}
