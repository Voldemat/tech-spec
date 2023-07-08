import { Command } from 'commander'
import { YamlLoader } from '../../loaders/yaml'
import { SpecFinder } from '../../spec/finder'
import { ValidateAction } from '../actions/validate'
import { buildActionCallback, FsUtils, SpecUtils } from '../utils'

export const validateCommand = (
    new Command('validate')
        .description('Validates yaml spec against schema')
        .argument(
            '<path-to-dir>', 'Path to directory containing yaml spec files'
        )
        .action(
            buildActionCallback(
                (pathToDir: string) => {
                    const fsUtils = new FsUtils()
                    return new ValidateAction(
                        fsUtils,
                        new SpecFinder(),
                        new YamlLoader(),
                        new SpecUtils()
                    ).run(
                        fsUtils.toAbsolutePath(pathToDir)
                    )
                }
            )
        )
)
