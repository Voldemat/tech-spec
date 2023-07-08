import { Command } from 'commander'
import { pathToSpecDirArgument } from './arguments/pathToSpecDir'
import { outputFileArgument } from './arguments/outputFile'
import { genTypeArgument } from './arguments/genType'

export const generateDiffCommand = (
    new Command('gen-diff')
        .description(
            'Finds the difference between tech-spec and generated validators'
        )
        .addArgument(genTypeArgument)
        .addArgument(pathToSpecDirArgument)
        .addArgument(outputFileArgument)
)
