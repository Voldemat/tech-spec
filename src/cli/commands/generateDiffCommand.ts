import { Argument, Command } from 'commander'
import { genDiffAction } from '../actions/genDiff'
import { buildActionCallback, toAbsolutePath } from '../utils'

const typeArgument = new Argument(
    '<type>', 'Type of generated code'
).choices(['validators'])
export const generateDiffCommand = (
    new Command()
        .command('gen-diff')
        .description(
            'Finds the difference between tech-spec and generated validators'
        )
        .addArgument(typeArgument)
        .argument(
            '<path-to-dir>', 'Path to directory containing yaml spec files'
        )
        .argument(
            '<output-file>', 'Path to file with validators'
        )
        .action(
            buildActionCallback(
                (
                    genType: 'validators',
                    pathToDir: string,
                    outputFile: string
                ) => {
                    return genDiffAction(
                        genType,
                        toAbsolutePath(pathToDir),
                        toAbsolutePath(outputFile)
                    )
                }
            )
        )
)
