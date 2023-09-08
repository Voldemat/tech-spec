import Ajv, { type ValidateFunction } from 'ajv'
import addFormats from 'ajv-formats'
import betterAjvErrors from 'better-ajv-errors'
import type {
    DesignSystem,
    Feature,
    Type,
    Form,
    TechSpec,
    TechSpecContainer
} from './types'
import {
    mainSchema,
    formSchema,
    featureSchema,
    designSystemSchema,
    typeSchema
} from './schemas'

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
        this.schema = this.ajv
            .addSchema(typeSchema)
            .addSchema(formSchema)
            .addSchema(featureSchema)
            .addSchema(designSystemSchema)
            .compile<boolean>(mainSchema)
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
        if (data.type === 'type' && data.spec.type === 'string') {
            const regex: string = data.spec.regex
            if (regex.includes('(?<')) {
                return (
                    `Type:${String(data.metadata.name)}: ` +
                    'Regex cannot contain lookbehind assertions'
                )
            }
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
        const types: Record<string, Type> = Object.fromEntries(
            specArray.filter(
                (t): t is Type => t.type === 'type'
            ).map(t => [t.metadata.name, t]))
        const forms: Form[] = this.mergeForms(specArray, types)
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

    mergeForms (specArray: TechSpec[], types: Record<string, Type>): Form[] {
        const errors: string[] = []
        const forms = specArray.filter(
            (form): form is Form => form.type === 'form'
        ).map(form => {
            const result = this.processForm(types, form)
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

    processForm (types: Record<string, Type>, form: Form): Form | string[] {
        const errors: string[] = []
        const newForm: Form = JSON.parse(JSON.stringify(form))
        Object.keys(newForm.spec).forEach(fieldName => {
            const typeName = newForm.spec[fieldName].type
            if (typeName in types) {
                newForm.spec[fieldName].typeSpec = types[typeName].spec
            } else {
                errors.push(
                    // eslint-disable-next-line
                    `Merging Error: form:${newForm.metadata.name}` +
                    `.spec.${fieldName}.typeName:` +
                    // eslint-disable-next-line
                    typeName +
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
