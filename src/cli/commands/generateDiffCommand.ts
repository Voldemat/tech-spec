import { Argument, Command } from 'commander'
import { AstFactory } from '../../generators/js'
import { SpecFinder } from '../../spec/finder'
import { YamlLoader } from '../../loaders/yaml'
import { GenDiffAction } from '../actions/genDiff'
import { buildActionCallback, FsUtils, SpecUtils } from '../utils'

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
                    const fsUtils = new FsUtils()
                    return new GenDiffAction(
                        fsUtils,
                        new YamlLoader(),
                        new SpecUtils(),
                        new SpecFinder(),
                        new AstFactory()
                    ).run(
                        genType,
                        fsUtils.toAbsolutePath(pathToDir),
                        fsUtils.toAbsolutePath(outputFile)
                    )
                }
            )
        )
)
