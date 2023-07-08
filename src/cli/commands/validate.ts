import { Command } from 'commander'
import { pathToSpecDirArgument } from './arguments/pathToSpecDir'

export const validateCommand = (
    new Command('validate')
        .description('Validates yaml spec against schema')
        .addArgument(pathToSpecDirArgument)
)
