import type { ActionResult } from '../../types'
import type { AstFactory } from '../../generators/js'
import type { IAction, TechSpec } from '../../spec/types'
import type { FsUtils, SpecUtils } from '../utils'

export class GenDiffAction implements IAction {
    constructor (
        private readonly fsUtils: FsUtils,
        private readonly specUtils: SpecUtils,
        private readonly astFactory: AstFactory
    ) {}

    run (
        specDir: string,
        outputDir: string
    ): ActionResult {
        const specResult = this.specUtils.getValidatedSpec(specDir)
        if (!specResult.ok) {
            return specResult.data
        }
        const generatedAst = this.astFactory.fromSpec(
            specResult.data as TechSpec[]
        )
        const specCode = this.fsUtils.readGeneratedFiles(outputDir)
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
