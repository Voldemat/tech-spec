#! /usr/bin/env node

import { Command } from 'commander'
import { validate } from './actions/validate';

const program = new Command();
program
    .command('validate')
    .description('Validates yaml spec against schema')
    .argument('<path-to-dir>', 'Path to directory containing yaml spec files')
    .action((pathToDir: string, _) => {
        const result = validate(pathToDir);
        if (result.isError) {
            program.error(result.message)
        } else {
            console.log(result.message)
        }
    });
program.parse();