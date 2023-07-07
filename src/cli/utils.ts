import Ajv from 'ajv';
import fs from 'fs';
import path from 'path';
import yaml from 'js-yaml'
import { ActionResult, Form, FormFieldSpec, TechSpec } from '../types';
import { schema } from '../schema';
import { Command } from 'commander';

export function isDirExists(pathToDir: string): boolean {
    return fs.existsSync(pathToDir)
}
export function findFiles(pathToDir: string): string[] {
    let filePaths: string[] = []
    fs.readdirSync(pathToDir).forEach(filePath => {
        const fullPath = path.join(pathToDir, filePath);
        const stat = fs.lstatSync(fullPath)
        if (stat.isDirectory()) {
            filePaths = filePaths.slice(filePath.indexOf(filePath), 1)
            filePaths.push(...findFiles(fullPath))
        } else if (filePath.endsWith('.tech-spec.yaml')) {
            filePaths.push(fullPath)
        }
    })
    return filePaths;
}
const ajv = new Ajv({
    useDefaults: true,
    allErrors: true,
});
export function validateSpec(data: Record<string, any>): string | null {
    const isValid = ajv.validate(schema, data)
    if (!isValid) {
        return JSON.stringify(ajv.errors, null, 4)
    }
    return null;
}
export function validateSpecArray(data: Record<string, any>[]): string | null {
    const errors = data.map(validateSpec).filter(e => e !== null);
    if (errors.length === 0) {
        return null;
    }
    return JSON.stringify(errors, null, 4);
}
export function loadFile(filePath: string): string {
    return fs.readFileSync(filePath, 'utf-8')
}
export function parseYaml(yamlString: string): TechSpec {
    return yaml.load(yamlString) as TechSpec
}
export function loadSpec(pathToDir: string): TechSpec[] {
    return findFiles(pathToDir)
        .map(loadFile)
        .map(parseYaml);
}
interface FormFieldSpecWithName extends FormFieldSpec {
    name: string
}
const exampleValue = {
    "type": "ObjectExpression",
    "properties": [
        {
            "type": "Property",
            "key": {
                "type": "Identifier",
                "name": "required"
            },
            "value": {
                "type": "Literal",
                "value": true,
                "raw": "true"
            },
            "kind": "init"
        },
        {
            "type": "Property",
            "key": {
                "type": "Identifier",
                "name": "regex"
            },
            "value": {
                "type": "Literal",
                "value": "",
                "raw": "\"\""
            },
            "kind": "init"
        },
        {
            "type": "Property",
            "key": {
                "type": "Identifier",
                "name": "errorMessage"
            },
            "value": {
                "type": "Literal",
                "value": null,
                "raw": "null"
            },
            "kind": "init"
        }
    ]
}
function buildFormFieldAst(field: FormFieldSpecWithName) {
    return {
        type: "Property",
        key: {
            type: "Identifier",
            name: field.name
        },
        kind: "init",
        value: {
            type: "ObjectExpression",
            properties: [
                {
                    "type": "Property",
                    "key": {
                        "type": "Identifier",
                        "name": "required"
                    },
                    "value": {
                        "type": "Literal",
                        "value": field.required,
                    },
                    "kind": "init"
                },
                {
                    "type": "Property",
                    "key": {
                        "type": "Identifier",
                        "name": "regex"
                    },
                    "value": {
                        "type": "Literal",
                        "value": field.regex,
                    },
                    "kind": "init"
                },
                {
                    "type": "Property",
                    "key": {
                        "type": "Identifier",
                        "name": "errorMessage"
                    },
                    "value": {
                        "type": "Literal",
                        "value": field.errorMessage,
                    },
                    "kind": "init"
                }
            ]
        }
    }
}
function buildFormAst(formName: string, fields: FormFieldSpecWithName[]) {
    return {
        type: "ExportNamedDeclaration",
        declaration: {
            type: "VariableDeclaration",
            kind: "const",
            declarations: [
                {
                    type: "VariableDeclarator",
                    id: {
                        type: "Identifier",
                        name: formName + 'Form'
                    },
                    init: {
                        type: "ObjectExpression",
                        properties: fields.map(buildFormFieldAst),
                    }
                }
            ]
        }
    }
}
export function generateJSAstForm(form: Form) {
    const formFields = Object.keys(form.spec) as (keyof Form['spec'])[]
    const fields = formFields.map((fieldName): FormFieldSpecWithName => {
        return {
            ...form.spec[fieldName],
            name: fieldName as string
        }
    })
    return buildFormAst(form.metadata.name, fields)
}
export function generateJSAstTreeFromSpecArray(specArray: TechSpec[]) {
    return {
        type: "Program",
        body: specArray.map(generateJSAstForm),
        sourceType: "module"
    }
}
export function printActionResult(program: Command, result: ActionResult) {
    if (result.isError) {
        program.error(result.message)
    } else {
        console.log(result.message)
    }
}
export function toAbsolutePath(relativePath: string): string {
    return path.join(process.env.PWD!, relativePath)
}
export function buildActionCallback(fn: (...args: any) => ActionResult): () => void {
    return (...args: any) => {
        const result = fn(...args);
        if (result.isError) {
            throw new Error(result.message);
        }
        console.log(result.message);
    }
}