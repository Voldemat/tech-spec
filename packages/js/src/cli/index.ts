#! /usr/bin/env node

import { AstFactory, CodeFactory } from '../generators/js'
import { BaseAstFactory } from '../generators/js/base'
import { YamlLoader } from '../loaders/yaml'
import { SpecValidator } from '../spec/validator'
import { CLI, type CLIContainer } from './cli'
import { FsUtils, SpecUtils } from './utils'

const fsUtils = new FsUtils()
const yamlLoader = new YamlLoader(fsUtils)
const specValidator = new SpecValidator()
const container: CLIContainer = {
    fsUtils,
    specUtils: new SpecUtils(fsUtils, yamlLoader, specValidator),
    specValidator,
    yamlLoader,
    astFactory: new AstFactory(new BaseAstFactory()),
    codeFactory: new CodeFactory()
}
export const cli = new CLI(container)
cli.run()
