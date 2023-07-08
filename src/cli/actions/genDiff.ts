import type { ActionResult } from '../../types'
import type { AstFactory } from '../../generators/js'
import type { IAction, TechSpec } from '../../spec/types'
import type { YamlLoader } from '../../loaders/yaml'
import type { SpecFinder } from '../../spec/finder'
import type { FsUtils, SpecUtils } from '../utils'

export class GenDiffAction implements IAction {
    constructor (
        private readonly fsUtils: FsUtils,
        private readonly yamlLoader: YamlLoader,
        private readonly specUtils: SpecUtils,
        private readonly specFinder: SpecFinder,
        private readonly astFactory: AstFactory
    ) {}

    run (
        genType: 'validators',
        pathToDir: string,
        outputFile: string
    ): ActionResult {
        if (!this.fsUtils.isDirExists(pathToDir)) {
            return {
                isError: true,
                message: 'Provided output directory does not exists'
            }
        }
        const specArray = this.specFinder
            .findFiles(pathToDir)
            .map(this.fsUtils.readFile)
            .map(this.yamlLoader.load)
        const error = this.specUtils.validateSpecArray(specArray)
        if (error !== null) {
            return {
                isError: true,
                message: error
            }
        }
        const specAst = this.astFactory.generateJSAstTreeFromSpecArray(
            specArray as TechSpec[]
        )
        const sourceCode = this.fsUtils.readFile(outputFile)
        const sourceCodeAst = this.astFactory.generateJSAstTreeFromCode(
            sourceCode
        )
        if (this.specUtils.isEqual(specAst, sourceCodeAst)) {
            return {
                isError: false,
                message: 'Validators are consistent with spec'
            }
        }
        return {
            isError: true,
            message: 'Validators are not consistent with spec'
        }
    }
}
