#! /usr/bin/env node

import { AstFactory, CodeFactory } from '../generators/js'
import { YamlLoader } from '../loaders/yaml'
import { CLI } from './cli'
import { FsUtils, SpecUtils } from './utils'

const cli = new CLI(
    new FsUtils(),
    new SpecUtils(),
    new YamlLoader(),
    new AstFactory(),
    new CodeFactory()
)
cli.run()
