import type { ActionResult } from '../../types'
import type { AstFactory } from '../../generators/js'
import type { IAction, TechSpec } from '../../spec/types'
import type { YamlLoader } from '../../loaders/yaml'
import type { FsUtils, SpecUtils } from '../utils'
import type { SpecCode } from '../../generators/types'

export class GenDiffAction implements IAction {
    constructor (
        private readonly fsUtils: FsUtils,
        private readonly yamlLoader: YamlLoader,
        private readonly specUtils: SpecUtils,
        private readonly astFactory: AstFactory
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
        const specArray = this.fsUtils
            .findSpecFiles(specDir)
            .map(this.fsUtils.readFile)
            .map(this.yamlLoader.load)
        if (specArray.length === 0) {
            return {
                isError: true,
                message: 'Provided directory doesn`t have any spec yaml files'
            }
        }
        const error = this.specUtils.validateSpecArray(specArray)
        if (error !== null) {
            return {
                isError: true,
                message: error
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
                message: 'Validators are consistent with spec'
            }
        }
        return {
            isError: true,
            message: 'Validators are not consistent with spec'
        }
    }
}
