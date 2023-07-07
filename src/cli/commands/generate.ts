import { Argument, Command } from 'commander'
import { generateAction } from '../actions/generate'
import { buildActionCallback, toAbsolutePath } from '../utils'

const typeArgument = new Argument(
    '<type>', 'Type of generated code'
).choices(['validators'])
export const generateCommand = (
    new Command('generate')
        .description('Generates code using tech-spec')
        .addArgument(typeArgument)
        .argument(
            '<path-to-dir>', 'Path to directory containing yaml spec files'
        )
        .argument('<output-file>', 'Path to output file')
        .action(
            buildActionCallback(
                (
                    genType: 'validators',
                    pathToDir: string,
                    outputFile: string
                ) => {
                    return generateAction(
                        genType,
                        toAbsolutePath(pathToDir),
                        toAbsolutePath(outputFile)
                    )
                }
            )
        )
)
