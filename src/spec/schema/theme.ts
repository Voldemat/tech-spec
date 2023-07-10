export const themeScheme = {
    properties: {
        type: { const: 'theme' },
        metadata: {
            type: 'object',
            properties: {
                name: { type: 'string' }
            },
            required: ['name']
        },
        spec: {
            type: 'object',
            properties: {
                colors: {
                    type: 'object',
                    patternProperties: {
                        '.*': { type: 'string' }
                    }
                }
            },
            required: ['colors']
        }
    },
    required: ['type', 'metadata', 'spec'],
    additionalProperties: false
}
