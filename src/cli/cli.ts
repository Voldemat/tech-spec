import { Command } from 'commander'
import { generateCommand } from './commands/generate'
import { buildActionCallback, type FsUtils, type SpecUtils } from './utils'
import type { YamlLoader } from '../loaders/yaml'
import type { AstFactory, CodeFactory } from '../generators/js'
import { GenerateAction } from './actions/generate'
import { validateCommand } from './commands/validate'
import { ValidateAction } from './actions/validate'
import { generateDiffCommand } from './commands/generateDiffCommand'
import { GenDiffAction } from './actions/genDiff'
import packageJson from '../../package.json'
import type { SpecValidator } from '../spec/validator'

export class CLI {
    private readonly program: Command
    constructor (
        fsUtils: FsUtils,
        specUtils: SpecUtils,
        specValidator: SpecValidator,
        yamlLoader: YamlLoader,
        astFactory: AstFactory,
        codeFactory: CodeFactory
    ) {
        this.program = new Command()
        this.program.version(packageJson.version)
        this.program.addCommand(
            generateCommand.action(
                buildActionCallback(
                    this.program,
                    new GenerateAction(
                        fsUtils,
                        yamlLoader,
                        specValidator,
                        astFactory,
                        codeFactory
                    )
                )
            )
        )
        this.program.addCommand(
            validateCommand.action(
                buildActionCallback(
                    this.program,
                    new ValidateAction(
                        fsUtils,
                        yamlLoader,
                        specValidator
                    )
                )
            )
        )
        this.program.addCommand(
            generateDiffCommand.action(
                buildActionCallback(
                    this.program,
                    new GenDiffAction(
                        fsUtils,
                        yamlLoader,
                        specUtils,
                        astFactory,
                        specValidator
                    )
                )
            )
        )
    }

    run (): void {
        this.program.parse()
    }
}
