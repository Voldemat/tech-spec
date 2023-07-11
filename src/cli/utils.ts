import fs from 'fs'
import path from 'path'
import yaml from 'js-yaml'
import lodash from 'lodash'
import * as emojis from 'node-emoji'
import chalk from 'chalk'
import { type Command } from 'commander'
import { validateSpec } from '../spec/validator'
import type { IAction, TechSpec } from '../spec/types'
import { FILE_SPEC_EXTENSION } from '../types'

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

    getTypeFromFilePath (filepath: string): TechSpec['type'] {
        return path.parse(filepath).name as TechSpec['type']
    }

    genCodeFileName (outpurDir: string, type: TechSpec['type']): string {
        return path.join(outpurDir, type + '.ts')
    }

    findCodeFiles (pathToDir: string): string[] {
        return this.findFiles(pathToDir, '.ts')
    }

    findSpecFiles (pathToDir: string): string[] {
        return this.findFiles(pathToDir, FILE_SPEC_EXTENSION)
    }

    findFiles (pathToDir: string, endsWith: string): string[] {
        let filePaths: string[] = []
        fs.readdirSync(pathToDir).forEach(filePath => {
            const fullPath = path.join(pathToDir, filePath)
            const stat = fs.lstatSync(fullPath)
            if (stat.isDirectory()) {
                filePaths = filePaths.slice(filePath.indexOf(filePath), 1)
                filePaths.push(...this.findFiles(fullPath, endsWith))
            } else if (filePath.endsWith(endsWith)) {
                filePaths.push(fullPath)
            }
        })
        return filePaths
    }

    createDir (dir: string): void {
        fs.mkdirSync(dir, { recursive: true })
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

export function createErrorMessage (message: string): string {
    return emojis.emojify(`🚨 ${chalk.redBright(message)}`)
}
export function createSuccessMessage (message: string): string {
    return emojis.emojify(`❇️  ${chalk.greenBright(message)}`)
}
export function buildActionCallback (
    program: Command, action: IAction
): () => void {
    return (...args: any) => {
        const result = action.run(...args)
        if (result.isError) {
            program.error(createErrorMessage(result.message))
        }
        console.log(createSuccessMessage(result.message))
    }
}
