import { Command } from 'commander'
import { outputPathArgument } from './arguments/outputPath'
import { pathToSpecDirArgument } from './arguments/pathToSpecDir'

export const generateDiffCommand = (
    new Command('gen-diff')
        .description(
            'Finds the difference between tech-spec and generated validators'
        )
        .addArgument(pathToSpecDirArgument)
        .addArgument(outputPathArgument)
)
