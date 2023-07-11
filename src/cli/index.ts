#! /usr/bin/env node

import { AstFactory, CodeFactory } from '../generators/js'
import { YamlLoader } from '../loaders/yaml'
import { CLI } from './cli'
import { FsUtils, SpecUtils } from './utils'

const fsUtils = new FsUtils()
const cli = new CLI(
    fsUtils,
    new SpecUtils(),
    new YamlLoader(fsUtils),
    new AstFactory(),
    new CodeFactory()
)
cli.run()
