import type { ActionResult, IAction } from '../../types'
import type { AstFactory } from '../../generators/js'
import type { TechSpec } from '../../spec/types'
import type { SpecUtils } from '../utils'
import { getEntries } from '../../utils'
import type { FsUtils } from '../fsUtils'
import type { CodeFactory } from '../../generators/js/codeFactory'

export class GenerateAction implements IAction {
    constructor (
        private readonly fsUtils: FsUtils,
        private readonly specUtils: SpecUtils,
        private readonly astFactory: AstFactory,
        private readonly codeFactory: CodeFactory
    ) {}

    run (
        specDir: string,
        outputDir: string
    ): ActionResult {
        const specResult = this.specUtils.getValidatedSpec(specDir)
        if (!specResult.ok) {
            return specResult.data
        }
        const ast = this.astFactory.fromSpec(specResult.data)
        const specCode = this.codeFactory.generate(ast)
        const existingEntries = getEntries(
            specCode
        ) as Array<[TechSpec['type'], string]>
        this.fsUtils.writeGeneratedFiles(outputDir, existingEntries)
        return {
            isError: false,
            messages: ['Code is successfully generated']
        }
    }
}
