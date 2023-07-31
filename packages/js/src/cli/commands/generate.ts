import { Command } from 'commander'
import { outputPathArgument } from './arguments/outputPath'
import { pathToSpecDirArgument } from './arguments/pathToSpecDir'

export const generateCommand = (
    new Command('generate')
        .description('Generates code using tech-spec')
        .addArgument(outputPathArgument)
        .addArgument(pathToSpecDirArgument)
)
