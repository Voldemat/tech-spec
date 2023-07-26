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
                        regex: { type: 'string', format: 'regex' },
                        errorMessage: {
                            type: 'string',
                            nullable: true
                        },
                        helperMessage: {
                            type: 'string',
                            nullable: true,
                            default: null
                        }
                    },
                    required: [
                        'regex',
                        'errorMessage',
                        'required',
                        'helperMessage'
                    ]
                }
            }
        }
    },
    required: ['type', 'metadata', 'spec'],
    additionalProperties: false
}
