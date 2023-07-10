import { type SchemaObject } from 'ajv'
import { formScheme } from './form'
import { themeScheme } from './theme'

export const techSpecSchema: SchemaObject = {
    type: 'object',
    discriminator: {
        propertyName: 'type'
    },
    required: ['type'],
    oneOf: [
        formScheme,
        themeScheme
    ]
}
