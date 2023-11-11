import type { ActionResult, IAction } from '../../types'
import type { SpecUtils } from '../utils'

interface ValidateActionContainer {
    readonly specUtils: SpecUtils
}
export class ValidateAction implements IAction {
    constructor (private readonly container: ValidateActionContainer) {}

    run (pathToDir: string): ActionResult {
        const specResult = this.container.specUtils.getValidatedSpec(pathToDir)
        if (!specResult.ok) {
            return specResult.data
        }
        return {
            isError: false,
            messages: ['Spec is valid']
        }
    }
}
