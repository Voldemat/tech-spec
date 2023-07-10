export const formScheme = {
    properties: {
        type: { const: 'form' },
        metadata: {
            type: 'object',
            properties: {
                name: { type: 'string' }
            },
            required: ['name']
        },
        spec: {
            type: 'object',
            patternProperties: {
                '.*': {
                    type: 'object',
                    properties: {
                        required: {
                            type: 'boolean',
                            default: true
                        },
                        regex: { type: 'string' },
                        errorMessage: {
                            type: 'string',
                            nullable: true
                        }
                    },
                    required: ['regex', 'errorMessage', 'required']
                }
            }
        }
    },
    required: ['type', 'metadata', 'spec'],
    additionalProperties: false
}
