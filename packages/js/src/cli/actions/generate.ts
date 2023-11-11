import type { ActionResult, IAction } from '../../types'
import type { TechSpec } from '../../spec/types'
import type { SpecUtils } from '../utils'
import { getEntries } from '../../utils'
import type { FsUtils } from '../fsUtils'
import type { CodeFactory } from '../../generators'

interface GenerateActionContainer {
    readonly fsUtils: FsUtils
    readonly specUtils: SpecUtils
    readonly codeFactory: CodeFactory
}
export class GenerateAction implements IAction {
    constructor (private readonly container: GenerateActionContainer) {}

    run (
        specDir: string,
        outputDir: string
    ): ActionResult {
        const specResult = this.container.specUtils.getValidatedSpec(specDir)
        if (!specResult.ok) {
            return specResult.data
        }
        const specCode = this.container.codeFactory.generate(specResult.data)
        const existingEntries = getEntries(
            specCode
        ) as Array<[TechSpec['type'], string | undefined]>
        this.container.fsUtils.writeGeneratedFiles(outputDir, existingEntries)
        return {
            isError: false,
            messages: ['Code is successfully generated']
        }
    }
}
