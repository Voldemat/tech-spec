import Ajv, { type ValidateFunction } from 'ajv'
import addFormats from 'ajv-formats'
import betterAjvErrors from 'better-ajv-errors'
import { techSpecSchema } from './schema'

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

    validate (data: Record<string, any>): string | null {
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
}
