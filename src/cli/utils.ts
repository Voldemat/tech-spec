import fs from 'fs'
import path from 'path'
import lodash from 'lodash'
import * as emojis from 'node-emoji'
import chalk from 'chalk'
import { type Command } from 'commander'
import type { IAction, TechSpec } from '../spec/types'
import {
    type ActionResult,
    FILE_SPEC_EXTENSION,
    type ILoaderErrorResult,
    type ILoaderSuccessResult
} from '../types'
import { Spinner } from 'cli-spinner'
import type { YamlLoader } from '../loaders/yaml'
import type { SpecValidator } from '../spec/validator'
import type { SpecCode } from '../generators/types'

interface ParsingResultSuccess {
    ok: true
    data: Array<Record<string, any>>
}
interface ParsingResultError {
    ok: false
    data: ActionResult
}
type ParsingResult = ParsingResultSuccess | ParsingResultError
const buildParsingError = (messages: string[]): ParsingResultError => {
    return {
        ok: false,
        data: {
            isError: true,
            messages
        }
    }
}

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

    writeGeneratedFiles (
        outputDir: string,
        files: Array<[TechSpec['type'], string]>
    ): void {
        outputDir = this.toAbsolutePath(outputDir)
        if (!this.isDirExists(outputDir)) {
            this.createDir(outputDir)
        }
        for (const [type, code] of files) {
            this.writeToFile(
                this.genCodeFileName(outputDir, type),
                code
            )
        }
    }

    readGeneratedFiles (
        dir: string
    ): SpecCode {
        dir = this.toAbsolutePath(dir)
        return this.findCodeFiles(dir)
            .reduce<Partial<SpecCode>>(
                (obj, filepath) => {
                    const code = this.readFile(filepath)
                    const type = this.getTypeFromFilePath(filepath)
                    obj[type] = code
                    return obj
                },
                {}
            ) as SpecCode
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
    constructor (
        private readonly fsUtils: FsUtils,
        private readonly yamlLoader: YamlLoader,
        private readonly specValidator: SpecValidator
    ) {}

    isEqual (
        spec1: Record<string, any>,
        spec2: Record<string, any>
    ): boolean {
        return lodash.isEqual(spec1, spec2)
    }

    parseSpec (pathToDir: string): ParsingResult {
        const parsingArray = this.fsUtils.findSpecFiles(pathToDir)
            .map(filepath => this.yamlLoader.load(filepath))
        if (parsingArray.length === 0) {
            return buildParsingError([
                'Provided directory doesn`t contain any tech-spec files'
            ])
        }
        const parsingErrorsArray = parsingArray.filter(
            (e): e is ILoaderErrorResult => e.error !== null
        ).map(e => e.error)
        if (parsingErrorsArray.length !== 0) {
            return buildParsingError(parsingErrorsArray)
        }
        return {
            ok: true,
            data: (parsingArray as ILoaderSuccessResult[]).map(r => r.data)
        }
    }

    getSpec (pathToDir: string): ParsingResult {
        if (!this.fsUtils.isDirExists(pathToDir)) {
            return buildParsingError(['Provided directory does not exists'])
        }
        return this.parseSpec(pathToDir)
    }

    getValidatedSpec (pathToDir: string): ParsingResult {
        const specArray = this.getSpec(pathToDir)
        if (!specArray.ok) {
            return specArray
        }
        const errors = specArray.data
            .map(spec => this.specValidator.validate(spec))
            .filter((e): e is string => e !== null)
        if (errors.length !== 0) {
            return {
                ok: false,
                data: {
                    isError: true,
                    messages: errors
                }
            }
        }
        return specArray
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
