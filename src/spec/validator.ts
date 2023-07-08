import Ajv from 'ajv'
import { techSpecSchema } from './schema'

const ajv = new Ajv({
    useDefaults: true,
    allErrors: true
})
const validateSchema = ajv.compile<boolean>(techSpecSchema)
export function validateSpec (data: Record<string, any>): string | null {
    const isValid = validateSchema(data)
    if (!isValid) {
        return JSON.stringify(ajv.errors, null, 4)
    }
    return null
}
