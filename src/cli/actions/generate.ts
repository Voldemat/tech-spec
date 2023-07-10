import type { ActionResult } from '../../types'
import type { CodeFactory, AstFactory } from '../../generators/js'
import type { IAction, TechSpec } from '../../spec/types'
import type { YamlLoader } from '../../loaders/yaml'
import type { FsUtils, SpecUtils } from '../utils'
import { getEntries } from '../../utils'

export class GenerateAction implements IAction {
    constructor (
        private readonly fsUtils: FsUtils,
        private readonly yamlLoader: YamlLoader,
        private readonly specUtils: SpecUtils,
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
                message: 'Provided spec directory does not exists'
            }
        }
        const specArray = this.fsUtils.findSpecFiles(specDir)
            .map(this.fsUtils.readFile)
            .map(this.yamlLoader.load)
        const error = this.specUtils.validateSpecArray(specArray)
        if (error !== null) {
            return {
                isError: true,
                message: error
            }
        }
        const ast = this.astFactory.fromSpec(
            specArray as TechSpec[]
        )
        const specCode = this.codeFactory.generate(ast)
        if (!this.fsUtils.isDirExists(outputDir)) {
            this.fsUtils.createDir(outputDir)
        }
        const existingEntries = getEntries(specCode)
            .filter(
                (entry): entry is [TechSpec['type'], string] => (
                    entry[1] !== null
                )
            )
        for (const [type, code] of existingEntries) {
            this.fsUtils.writeToFile(
                this.fsUtils.genCodeFileName(outputDir, type),
                code
            )
        }
        return {
            isError: false,
            message: 'Code is successfully generated'
        }
    }
}
