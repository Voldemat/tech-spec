import type { ActionResult, IAction } from '../../types'
import type { SpecUtils } from '../utils'

export class ValidateAction implements IAction {
    constructor (private readonly specUtils: SpecUtils) {}

    run (pathToDir: string): ActionResult {
        const specResult = this.specUtils.getValidatedSpec(pathToDir)
        if (!specResult.ok) {
            return specResult.data
        }
        return {
            isError: false,
            messages: ['Spec is valid']
        }
    }
}
