#! /usr/bin/env node

import { CodeFactory, SpecGenerator } from '../generators'
import { YamlLoader } from '../loaders/yaml'
import { SpecValidator } from '../spec/validator'
import { CLI, type CLIContainer } from './cli'
import { FsUtils } from './fsUtils'
import { SpecUtils } from './utils'

const fsUtils = new FsUtils()
const yamlLoader = new YamlLoader(fsUtils)
const specValidator = new SpecValidator()
const container: CLIContainer = {
    fsUtils,
    specUtils: new SpecUtils(fsUtils, yamlLoader, specValidator),
    specValidator,
    yamlLoader,
    codeFactory: new CodeFactory(),
    specGenerator: new SpecGenerator()
}
export const cli = new CLI(container)
cli.run()
