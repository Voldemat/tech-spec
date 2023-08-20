import lodash from 'lodash'
import * as emojis from 'node-emoji'
import chalk from 'chalk'
import { type Command } from 'commander'
import type { IAction, TechSpecContainer } from '../spec/types'
import {
    type ActionResult,
    type ILoaderErrorResult,
    type ILoaderSuccessResult
} from '../types'
import { Spinner } from 'cli-spinner'
import type { YamlLoader } from '../loaders/yaml'
import { type SpecValidator, SpecValidatorError } from '../spec/validator'
import { type FsUtils } from './fsUtils'

interface ResultSuccess<T> {
    ok: true
    data: T
}
interface ResultError<T> {
    ok: false
    data: T
}
type Result<S, E> = ResultSuccess<S> | ResultError<E>
const buildParsingError = (messages: string[]): ResultError<ActionResult> => {
    return {
        ok: false,
        data: {
            isError: true,
            messages
        }
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

    parseSpec (
        pathToDir: string
    ): Result<Array<Record<string, any>>, ActionResult> {
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

    getSpec (
        pathToDir: string
    ): Result<Array<Record<string, any>>, ActionResult> {
        if (!this.fsUtils.isDirExists(pathToDir)) {
            return buildParsingError(['Provided directory does not exists'])
        }
        return this.parseSpec(pathToDir)
    }

    validateSpec (
        specArray: Result<Array<Record<string, any>>, ActionResult>
    ): Result<TechSpecContainer, ActionResult> {
        if (!specArray.ok) {
            return specArray
        }
        try {
            return {
                ok: true,
                data: this.specValidator.validate(specArray.data)
            }
        } catch (error) {
            if (error instanceof SpecValidatorError) {
                return {
                    ok: false,
                    data: {
                        isError: true,
                        messages: error.messages
                    }
                }
            }
            throw error
        }
    }

    getFields (
        data: Array<Record<string, any>>
    ): Record<string, Record<string, any>> {
        return Object.fromEntries(
            data.filter(d => d.type === 'field').map(d => {
                return [d.metadata.name, d]
            })
        )
    }

    getValidatedSpec (
        pathToDir: string
    ): Result<TechSpecContainer, ActionResult> {
        const specArray = this.getSpec(pathToDir)
        return this.validateSpec(specArray)
    }
}

const spinner = new Spinner('Processing...')
spinner.setSpinnerString('⠋⠙⠹⠸⠼⠴⠦⠧⠇⠏')
const msgDelimeter = chalk.whiteBright('\n' + '_'.repeat(40) + '\n\n')
export function createErrorMessage (messages: string[]): string {
    return messages
        .map(
            msg => emojis.emojify('🚨 ' + chalk.redBright`${msg}`)
        )
        .join(msgDelimeter)
}
export function createSuccessMessage (messages: string[]): string {
    return messages
        .map(msg => emojis.emojify('❇️  ' + chalk.greenBright`${msg}`))
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
