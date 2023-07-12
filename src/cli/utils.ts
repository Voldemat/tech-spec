import fs from 'fs'
import path from 'path'
import lodash from 'lodash'
import * as emojis from 'node-emoji'
import chalk from 'chalk'
import { type Command } from 'commander'
import type { IAction, TechSpec } from '../spec/types'
import { FILE_SPEC_EXTENSION } from '../types'
import { Spinner } from 'cli-spinner'

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
        if (relativePath.startsWith('/')) return relativePath
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
    isEqual (
        spec1: Record<string, any>,
        spec2: Record<string, any>
    ): boolean {
        return lodash.isEqual(spec1, spec2)
    }
}

const spinner = new Spinner('Processing...')
spinner.setSpinnerString('⠋⠙⠹⠸⠼⠴⠦⠧⠇⠏')
const msgDelimeter = chalk.whiteBright('\n' + '_'.repeat(40) + '\n\n')
export function createErrorMessage (messages: string[]): string {
    return messages
        .map(
            msg => emojis.emojify(`🚨 ${chalk.redBright(msg)}`)
        )
        .join(msgDelimeter)
}
export function createSuccessMessage (messages: string[]): string {
    return messages
        .map(msg => emojis.emojify(`❇️  ${chalk.greenBright(msg)}`))
        .join(msgDelimeter)
}
export function buildActionCallback (
    program: Command, action: IAction
): () => void {
    return (...args: any) => {
        spinner.start()
        const result = action.run(...args)
        spinner.stop(true)
        if (result.isError) {
            program.error(createErrorMessage(result.messages))
        }
        console.log(createSuccessMessage(result.messages))
    }
}
