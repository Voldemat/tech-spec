import { SchemaObject } from "ajv";

export const schema: SchemaObject = {
    type: "object",
    properties: {
        type: {
            enum: ["form"]
        },
        metadata: {
            type: "object",
            properties: {
                name: {
                    type: "string"
                }
            },
            required: ['name']
        },
        spec: {
            type: "object",
            patternProperties: {
                ".*": {
                    type: "object",
                    properties: {
                        required: {
                            type: "boolean",
                            default: true,
                        },
                        regex: {
                            type: "string"
                        },
                        errorMessage: {
                            type: "string",
                            nullable: true
                        },
                    },
                    required: ['regex', 'errorMessage', 'required']
                }
            }
        }
    },
    required: ["type", "metadata", "spec"],
    additionalProperties: false,
}