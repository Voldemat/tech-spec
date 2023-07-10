import type { YamlLoader } from '../../loaders/yaml'
import type { IAction } from '../../spec/types'
import type { ActionResult } from '../../types'
import type { FsUtils, SpecUtils } from '../utils'

export class ValidateAction implements IAction {
    constructor (
        private readonly fsUtils: FsUtils,
        private readonly yamlLoader: YamlLoader,
        private readonly specUtils: SpecUtils
    ) {}

    run (pathToDir: string): ActionResult {
        pathToDir = this.fsUtils.toAbsolutePath(pathToDir)
        if (!this.fsUtils.isDirExists(pathToDir)) {
            return {
                isError: true,
                message: 'Provided directory does not exists'
            }
        }
        const error = this.specUtils.validateSpecArray(
            this.fsUtils.findSpecFiles(pathToDir)
                .map(this.fsUtils.readFile)
                .map(this.yamlLoader.load)
        )
        if (error === null) {
            return {
                isError: false,
                message: 'Spec is valid'
            }
        }
        return {
            isError: true,
            message: error
        }
    }
}
