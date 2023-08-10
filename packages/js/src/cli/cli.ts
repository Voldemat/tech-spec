import fs from 'fs'
import path from 'path'
import { Command } from 'commander'
import { generateCommand } from './commands/generate'
import { buildActionCallback, type SpecUtils } from './utils'
import type { YamlLoader } from '../loaders/yaml'
import type { AstFactory, CodeFactory } from '../generators/js'
import { GenerateAction } from './actions/generate'
import { validateCommand } from './commands/validate'
import { ValidateAction } from './actions/validate'
import { generateDiffCommand } from './commands/generateDiffCommand'
import { GenDiffAction } from './actions/genDiff'
import type { SpecValidator } from '../spec/validator'
import type { IAction } from '../spec/types'
import type { CodeToSpecGenerator } from '../generators/js/specGenerator'
import type { FsUtils } from './fsUtils'

const packageJson = JSON.parse(
    fs.readFileSync(
        path.join(__filename, '../../..', 'package.json'),
        'utf-8'
    )
)

export interface CLIContainer {
    fsUtils: FsUtils
    specUtils: SpecUtils
    specValidator: SpecValidator
    yamlLoader: YamlLoader
    astFactory: AstFactory
    codeFactory: CodeFactory
    specGenerator: CodeToSpecGenerator
}

export class CLI {
    private readonly program: Command
    constructor (container: CLIContainer) {
        this.program = new Command()
        this.program.version(packageJson.version)
        this.addCommand(generateCommand, this.buildGenerateAction(container))
        this.addCommand(validateCommand, this.buildValidateAction(container))
        this.addCommand(generateDiffCommand, this.buildGenDiffAction(container))
    }

    private buildGenerateAction (container: CLIContainer): GenerateAction {
        return new GenerateAction(
            container.fsUtils,
            container.specUtils,
            container.astFactory,
            container.codeFactory
        )
    }

    private buildValidateAction (container: CLIContainer): ValidateAction {
        return new ValidateAction(container.specUtils)
    }

    private buildGenDiffAction (container: CLIContainer): GenDiffAction {
        return new GenDiffAction(
            container.fsUtils,
            container.specUtils,
            container.astFactory,
            container.specGenerator
        )
    }

    private addCommand (
        command: Command,
        action: IAction
    ): void {
        this.program.addCommand(
            command.action(
                buildActionCallback(
                    this.program,
                    action
                )
            )
        )
    }

    run (): void {
        this.program.parse()
    }
}
