import Ajv, { type ErrorObject } from 'ajv'
import { techSpecSchema } from './schema'

const ajv = new Ajv({
    useDefaults: true,
    allErrors: true,
    discriminator: true,
    strict: false
})
const validateSchema = ajv.compile<boolean>(techSpecSchema)
export function validateSpec (
    data: Record<string, any>
): Array<ErrorObject<string, Record<string, any>, unknown>> | null {
    const isValid = validateSchema(data)
    if (!isValid) {
        return validateSchema.errors as Array<
            ErrorObject<string, Record<string, any>, unknown>
        >
    }
    return null
}
