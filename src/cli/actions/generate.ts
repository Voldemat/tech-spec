import type { ActionResult } from '../../types'
import type { Node } from 'acorn'
import type { CodeFactory, AstFactory } from '../../generators/js'
import type { IAction, TechSpec } from '../../spec/types'
import type { YamlLoader } from '../../loaders/yaml'
import type { FsUtils, SpecUtils } from '../utils'
import type { SpecFinder } from '../../spec/finder'

export class GenerateAction implements IAction {
    constructor (
        private readonly fsUtils: FsUtils,
        private readonly yamlLoader: YamlLoader,
        private readonly specUtils: SpecUtils,
        private readonly astFactory: AstFactory,
        private readonly specFinder: SpecFinder,
        private readonly codeFactory: CodeFactory
    ) {}

    run (
        genType: 'validators',
        pathToDir: string,
        outputFile: string
    ): ActionResult {
        pathToDir = this.fsUtils.toAbsolutePath(pathToDir)
        outputFile = this.fsUtils.toAbsolutePath(outputFile)
        if (!this.fsUtils.isDirExists(pathToDir)) {
            return {
                isError: true,
                message: 'Provided output directory does not exists'
            }
        }
        const specArray = this.specFinder.findFiles(pathToDir)
            .map(this.fsUtils.readFile)
            .map(this.yamlLoader.load)
        const error = this.specUtils.validateSpecArray(specArray)
        if (error !== null) {
            return {
                isError: true,
                message: error
            }
        }
        const ast = this.astFactory.generateJSAstTreeFromSpecArray(
            specArray as TechSpec[]
        )
        const sourceCode = this.codeFactory.generate(ast as Node)
        this.fsUtils.writeToFile(outputFile, sourceCode)
        return {
            isError: false,
            message: 'Code is successfully generated'
        }
    }
}
