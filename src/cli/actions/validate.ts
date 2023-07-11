import type { YamlLoader } from '../../loaders/yaml'
import type { IAction } from '../../spec/types'
import type { SpecValidator } from '../../spec/validator'
import type {
    ActionResult,
    ILoaderErrorResult,
    ILoaderSuccessResult
} from '../../types'
import type { FsUtils } from '../utils'

export class ValidateAction implements IAction {
    constructor (
        private readonly fsUtils: FsUtils,
        private readonly yamlLoader: YamlLoader,
        private readonly specValidator: SpecValidator
    ) {}

    run (pathToDir: string): ActionResult {
        pathToDir = this.fsUtils.toAbsolutePath(pathToDir)
        if (!this.fsUtils.isDirExists(pathToDir)) {
            return {
                isError: true,
                messages: ['Provided directory does not exists']
            }
        }
        const parsingArray = this.fsUtils.findSpecFiles(pathToDir)
            .map(filepath => this.yamlLoader.load(filepath))
        if (parsingArray.length === 0) {
            return {
                isError: true,
                messages: [
                    'Provided directory doesn`t contain any tech-spec files'
                ]
            }
        }
        const parsingErrorsArray = parsingArray.filter(
            (e): e is ILoaderErrorResult => e.error !== null
        ).map(e => e.error)
        if (parsingErrorsArray.length !== 0) {
            return {
                isError: true,
                messages: parsingErrorsArray
            }
        }
        const specArray = (parsingArray as ILoaderSuccessResult[]).map(
            r => r.data
        )
        const errors = specArray
            .map(spec => this.specValidator.validate(spec))
            .filter((e): e is string => e !== null)
        if (errors.length === 0) {
            return {
                isError: false,
                messages: ['Spec is valid']
            }
        }
        return {
            isError: true,
            messages: errors
        }
    }
}
