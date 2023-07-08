import fs from 'fs'
import path from 'path'
import yaml from 'js-yaml'
import lodash from 'lodash'
import { validateSpec } from '../spec/validator'
import type { IAction, TechSpec } from '../spec/types'
import { type Command } from 'commander'

export class FsUtils {
    isDirExists (pathToDir: string): boolean {
        return fs.existsSync(pathToDir)
    }

    readFile (filePath: string): string {
        return fs.readFileSync(filePath, 'utf-8')
    }

    writeToFile (filePath: string, content: string): void {
        fs.writeFileSync(filePath, content)
    }

    toAbsolutePath (relativePath: string): string {
        if (process.env.PWD == null) {
            throw new Error('PWD End is not defined')
        }
        return path.join(process.env.PWD, relativePath)
    }
}
export class SpecUtils {
    validateSpecArray (data: Array<Record<string, any>>): string | null {
        const errors = data.map(validateSpec).filter(e => e !== null)
        if (errors.length === 0) { return null }
        return JSON.stringify(errors, null, 4)
    }

    parseYaml (yamlString: string): TechSpec {
        return yaml.load(yamlString) as TechSpec
    }

    isEqual (
        spec1: Record<string, any>,
        spec2: Record<string, any>
    ): boolean {
        return lodash.isEqual(spec1, spec2)
    }
}

export function buildActionCallback (
    program: Command, action: IAction
): () => void {
    return (...args: any) => {
        const result = action.run(...args)
        if (result.isError) {
            program.error(result.message)
        }
        console.log(result.message)
    }
}
