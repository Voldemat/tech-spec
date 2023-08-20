import Ajv, { type ValidateFunction } from 'ajv'
import addFormats from 'ajv-formats'
import betterAjvErrors from 'better-ajv-errors'
import techSpecSchema from '../schema.json'
import type {
    DesignSystem,
    Feature,
    Field,
    Form,
    TechSpec,
    TechSpecContainer
} from './types'

export class SpecValidatorError extends Error {
    messages: string[]
    constructor (messages: string[]) {
        super(JSON.stringify(messages))
        this.messages = messages
    }
}

export class SpecValidator {
    private readonly ajv: Ajv
    private readonly schema: ValidateFunction<boolean>
    constructor () {
        this.ajv = new Ajv({
            useDefaults: true,
            allErrors: true,
            discriminator: true,
            strict: false,
            verbose: true
        })
        addFormats(this.ajv)
        this.schema = this.ajv.compile<boolean>(techSpecSchema)
    }

    validateOneSpec (data: Record<string, any>): string | null {
        const isValid = this.schema(data)
        if (!isValid) {
            if (this.schema.errors == null) {
                throw new Error('this.schema.errors is null or undefined')
            }
            return betterAjvErrors(this.schema, data, this.schema.errors, {
                indent: 4
            })
        }
        return null
    }

    validate (data: Array<Record<string, any>>): TechSpecContainer {
        const errors = data
            .map(spec => this.validateOneSpec(spec))
            .filter((e): e is string => e !== null)
        if (errors.length !== 0) {
            throw new SpecValidatorError(errors)
        }
        const specArray = (data as TechSpec[])
        const fields: Record<string, Field> = Object.fromEntries(
            specArray.filter(
                (f): f is Field => f.type === 'field'
            ).map(field => [field.metadata.name, field]))
        const forms: Form[] = this.mergeForms(specArray, fields)
        const designSystems = specArray.filter(
            (t): t is DesignSystem => t.type === 'DesignSystem'
        )
        const features = specArray.filter(
            (f): f is Feature => f.type === 'feature'
        )
        return {
            designSystems,
            forms,
            features
        }
    }

    mergeForms (specArray: TechSpec[], fields: Record<string, Field>): Form[] {
        const errors: string[] = []
        const forms = specArray.filter(
            (form): form is Form => form.type === 'form'
        ).map(form => {
            const result = this.processForm(fields, form)
            if (result instanceof Array) {
                errors.push(...result)
                return null
            }
            return result
        }).filter((form): form is Form => form !== null)
        if (errors.length > 0) {
            throw new SpecValidatorError(errors)
        }
        return forms
    }

    processForm (fields: Record<string, Field>, form: Form): Form | string[] {
        const errors: string[] = []
        const newForm: Form = JSON.parse(JSON.stringify(form))
        Object.keys(newForm.spec).forEach(fieldName => {
            const fieldRef = newForm.spec[fieldName].fieldRef
            if (fieldRef in fields) {
                newForm.spec[fieldName].field = fields[fieldRef]
            } else {
                errors.push(
                    `Merging Error: form:${newForm.metadata.name}` +
                    `.spec.${fieldName}.fieldRef:` +
                    newForm.spec[fieldName].fieldRef +
                    ' does not exists'
                )
            }
        })
        if (errors.length > 0) {
            return errors
        }
        return newForm
    }
}
