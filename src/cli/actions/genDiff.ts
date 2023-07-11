import type {
    ActionResult,
    ILoaderErrorResult,
    ILoaderSuccessResult
} from '../../types'
import type { AstFactory } from '../../generators/js'
import type { IAction, TechSpec } from '../../spec/types'
import type { YamlLoader } from '../../loaders/yaml'
import type { FsUtils, SpecUtils } from '../utils'
import type { SpecCode } from '../../generators/types'
import type { SpecValidator } from '../../spec/validator'

export class GenDiffAction implements IAction {
    constructor (
        private readonly fsUtils: FsUtils,
        private readonly yamlLoader: YamlLoader,
        private readonly specUtils: SpecUtils,
        private readonly astFactory: AstFactory,
        private readonly specValidator: SpecValidator
    ) {}

    run (
        specDir: string,
        outputDir: string
    ): ActionResult {
        specDir = this.fsUtils.toAbsolutePath(specDir)
        outputDir = this.fsUtils.toAbsolutePath(outputDir)
        if (!this.fsUtils.isDirExists(specDir)) {
            return {
                isError: true,
                messages: ['Provided spec directory does not exists']
            }
        }
        const parsingArray = this.fsUtils
            .findSpecFiles(specDir)
            .map(filepath => this.yamlLoader.load(filepath))
        if (parsingArray.length === 0) {
            return {
                isError: true,
                messages: [
                    'Provided directory doesn`t have any spec yaml files'
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
            (r) => r.data
        )
        const errors = specArray
            .map(spec => this.specValidator.validate(spec))
            .filter((e): e is string => e !== null)
        if (errors.length !== 0) {
            return {
                isError: true,
                messages: errors
            }
        }
        const generatedAst = this.astFactory.fromSpec(
            specArray as TechSpec[]
        )
        const specCode: SpecCode = this.fsUtils
            .findCodeFiles(outputDir)
            .reduce<Partial<SpecCode>>(
                (obj, filepath) => {
                    const code = this.fsUtils.readFile(filepath)
                    const type = this.fsUtils.getTypeFromFilePath(filepath)
                    obj[type] = code
                    return obj
                },
                {}
            ) as SpecCode
        const sourceCodeAst = this.astFactory.fromCode(specCode)
        if (this.specUtils.isEqual(generatedAst, sourceCodeAst)) {
            return {
                isError: false,
                messages: ['Validators are consistent with spec']
            }
        }
        return {
            isError: true,
            messages: ['Validators are not consistent with spec']
        }
    }
}
