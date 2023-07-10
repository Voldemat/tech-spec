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

export class CLI {
    private readonly program: Command
    constructor (
        fsUtils: FsUtils,
        specUtils: SpecUtils,
        yamlLoader: YamlLoader,
        astFactory: AstFactory,
        codeFactory: CodeFactory
    ) {
        this.program = new Command()
        this.program.addCommand(
            generateCommand.action(
                buildActionCallback(
                    this.program,
                    new GenerateAction(
                        fsUtils,
                        yamlLoader,
                        specUtils,
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
                        specUtils
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
                        astFactory
                    )
                )
            )
        )
    }

    run (): void {
        this.program.parse()
    }
}
