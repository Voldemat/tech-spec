import { Command } from 'commander'
import { validateAction } from '../actions/validate'
import { buildActionCallback, toAbsolutePath } from '../utils'

export const validateCommand = (
    new Command('validate')
        .description('Validates yaml spec against schema')
        .argument(
            '<path-to-dir>', 'Path to directory containing yaml spec files'
        )
        .action(
            buildActionCallback(
                (pathToDir: string) => {
                    return validateAction(toAbsolutePath(pathToDir))
                }
            )
        )
)
