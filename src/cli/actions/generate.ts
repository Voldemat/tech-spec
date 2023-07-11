import type {
    ActionResult,
    ILoaderErrorResult,
    ILoaderSuccessResult
} from '../../types'
import type { CodeFactory, AstFactory } from '../../generators/js'
import type { IAction, TechSpec } from '../../spec/types'
import type { YamlLoader } from '../../loaders/yaml'
import type { FsUtils } from '../utils'
import type { SpecValidator } from '../../spec/validator'
import { getEntries } from '../../utils'

export class GenerateAction implements IAction {
    constructor (
        private readonly fsUtils: FsUtils,
        private readonly yamlLoader: YamlLoader,
        private readonly specValidator: SpecValidator,
        private readonly astFactory: AstFactory,
        private readonly codeFactory: CodeFactory
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
        const parsingArray = this.fsUtils.findSpecFiles(specDir)
            .map(filepath => this.yamlLoader.load(filepath))
        const specParsingErrors = parsingArray.filter(
            (e): e is ILoaderErrorResult => e.error !== null
        ).map(e => e.error)
        if (specParsingErrors.length !== 0) {
            return {
                isError: true,
                messages: specParsingErrors
            }
        }
        const specArray = (parsingArray as ILoaderSuccessResult[]).map(
            r => r.data
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
        const ast = this.astFactory.fromSpec(
            specArray as TechSpec[]
        )
        const specCode = this.codeFactory.generate(ast)
        if (!this.fsUtils.isDirExists(outputDir)) {
            this.fsUtils.createDir(outputDir)
        }
        const existingEntries = getEntries(
            specCode
        ) as Array<[TechSpec['type'], string]>
        for (const [type, code] of existingEntries) {
            this.fsUtils.writeToFile(
                this.fsUtils.genCodeFileName(outputDir, type),
                code
            )
        }
        return {
            isError: false,
            messages: ['Code is successfully generated']
        }
    }
}
