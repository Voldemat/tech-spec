import type { ActionResult, IAction } from '../../types'
import type { AstFactory } from '../../generators/js'
import type { SpecUtils } from '../utils'
import type { CodeToSpecGenerator } from '../../generators/js/specGenerator'
import type { FsUtils } from '../fsUtils'

export class GenDiffAction implements IAction {
    constructor (
        private readonly fsUtils: FsUtils,
        private readonly specUtils: SpecUtils,
        private readonly astFactory: AstFactory,
        private readonly specGenerator: CodeToSpecGenerator
    ) {}

    run (
        specDir: string,
        outputDir: string
    ): ActionResult {
        const specResult = this.specUtils.getValidatedSpec(specDir)
        if (!specResult.ok) {
            return specResult.data
        }
        const spec = specResult.data
        const sourceCodeAst = this.astFactory.fromCode(
            this.fsUtils.readGeneratedFiles(outputDir)
        )
        const codeSpec = this.specGenerator.fromAst(sourceCodeAst)
        if (this.specUtils.isEqual(spec, codeSpec)) {
            return {
                isError: false,
                messages: ['Generated code is consistent with spec']
            }
        }
        return {
            isError: true,
            messages: ['Generated code is not consistent with spec']
        }
    }
}
