import type { ActionResult, IAction } from '../../types'
import type { SpecUtils } from '../utils'
import type { FsUtils } from '../fsUtils'
import type { SpecGenerator } from '../../generators'

interface GenDiffActionContainer {
    readonly fsUtils: FsUtils
    readonly specUtils: SpecUtils
    readonly specGenerator: SpecGenerator
}
export class GenDiffAction implements IAction {
    constructor (private readonly container: GenDiffActionContainer) {}
    run (
        specDir: string,
        outputDir: string
    ): ActionResult {
        const specResult = this.container.specUtils.getValidatedSpec(specDir)
        if (!specResult.ok) {
            return specResult.data
        }
        const spec = specResult.data
        spec.designSystems = []
        spec.features = []
        const code = this.container.fsUtils.readGeneratedFiles(outputDir)
        const codeSpec = this.container.specGenerator.fromCode(code)
        if (this.container.specUtils.isEqual(spec, codeSpec)) {
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
