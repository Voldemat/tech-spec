import { Argument, Command } from 'commander'
import { AstFactory, CodeFactory } from '../../generators/js'
import { YamlLoader } from '../../loaders/yaml'
import { SpecFinder } from '../../spec/finder'
import { GenerateAction } from '../actions/generate'
import { buildActionCallback, FsUtils, SpecUtils } from '../utils'

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
                    const fsUtils = new FsUtils()
                    return new GenerateAction(
                        fsUtils,
                        new YamlLoader(),
                        new SpecUtils(),
                        new AstFactory(),
                        new SpecFinder(),
                        new CodeFactory()
                    ).run(
                        genType,
                        fsUtils.toAbsolutePath(pathToDir),
                        fsUtils.toAbsolutePath(outputFile)
                    )
                }
            )
        )
)
