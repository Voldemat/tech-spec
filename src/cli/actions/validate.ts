import Ajv, { Schema, SchemaObject } from 'ajv';
import fs from 'fs';
import yaml from 'js-yaml';
import { ActionResult } from '../types';
import { findFiles, isDirExists } from '../utils';

const schema: SchemaObject = {
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
const ajv = new Ajv();
function validateFile(filePath: string): string | null {
    const data = yaml.load(fs.readFileSync(filePath, 'utf-8'));
    const isValid = ajv.validate(schema, data)
    if (!isValid) {
        return JSON.stringify(ajv.errors, null, 4)
    }
    return null;
}

export function validate(pathToDir: string): ActionResult {
    if (!isDirExists(pathToDir)) {
        return {
            isError: true,
            message: 'Provided directory does not exists'
        }
    }
    const filePaths = findFiles(pathToDir);
    const errors = filePaths.map(validateFile).filter(e => e !== null);
    if (errors.length === 0) {
        return {
            isError: false,
            message: 'Spec is valid'
        }
    }
    return {
        isError: true,
        message: errors.join('\n') 
    }
}