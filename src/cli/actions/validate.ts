import { validateSpec } from '../../spec/validator'
import { type ActionResult } from '../../types'
import {
    isDirExists,
    loadSpecFilesData
} from '../utils'

export function validateAction (pathToDir: string): ActionResult {
    if (!isDirExists(pathToDir)) {
        return {
            isError: true,
            message: 'Provided directory does not exists'
        }
    }
    const errors = loadSpecFilesData(pathToDir)
        .map(validateSpec)
        .filter(e => e !== null)
    if (errors.length === 0) {
        return {
            isError: false,
            message: 'Spec is valid'
        }
    }
    return {
        isError: true,
        message: errors.join('\n')
    }
}
