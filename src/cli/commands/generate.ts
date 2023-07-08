import { Command } from 'commander'
import { genTypeArgument } from './arguments/genType'
import { outputFileArgument } from './arguments/outputFile'
import { pathToSpecDirArgument } from './arguments/pathToSpecDir'

export const generateCommand = (
    new Command('generate')
        .description('Generates code using tech-spec')
        .addArgument(genTypeArgument)
        .addArgument(outputFileArgument)
        .addArgument(pathToSpecDirArgument)
)
