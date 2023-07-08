#! /usr/bin/env node

import { AstFactory, CodeFactory } from '../generators/js'
import { YamlLoader } from '../loaders/yaml'
import { SpecFinder } from '../spec/finder'
import { CLI } from './cli'
import { FsUtils, SpecUtils } from './utils'

const cli = new CLI(
    new FsUtils(),
    new SpecUtils(),
    new SpecFinder(),
    new YamlLoader(),
    new AstFactory(),
    new CodeFactory()
)
cli.run()
