import fs from 'fs'
import path from 'path'
import yaml from 'js-yaml'
import type { ActionResult } from '../types'
import { validateSpec } from '../spec/validator'
import { findFiles } from '../spec/finder'
import { type TechSpec } from '../spec/types'

export function isDirExists (pathToDir: string): boolean {
    return fs.existsSync(pathToDir)
}

export function validateSpecArray (
    data: Array<Record<string, any>>
): string | null {
    const errors = data.map(validateSpec).filter(e => e !== null)
    if (errors.length === 0) { return null }
    return JSON.stringify(errors, null, 4)
}
export function parseYaml (yamlString: string): TechSpec {
    return yaml.load(yamlString) as TechSpec
}
export function loadSpecFilesData (
    pathToDir: string
): Array<Record<string, any>> {
    return findFiles(pathToDir)
        .map(filePath => fs.readFileSync(filePath, 'utf-8'))
        .map(content => yaml.load(content) as Record<string, any>)
}

export function toAbsolutePath (relativePath: string): string {
    if (process.env.PWD == null) {
        throw new Error('PWD End is not defined')
    }
    return path.join(process.env.PWD, relativePath)
}
export function buildActionCallback (
    fn: (...args: any) => ActionResult
): () => void {
    return (...args: any) => {
        const result = fn(...args)
        if (result.isError) {
            throw new Error(result.message)
        }
        console.log(result.message)
    }
}
