#! /usr/bin/env node

import path from 'path'
import { Argument, Command } from 'commander'
import { validateAction } from './actions/validate';
import { generateAction } from './actions/generate';
import { printActionResult } from './utils';
import { genDiffAction } from './actions/genDiff';

const program = new Command();
program
    .command('validate')
    .description('Validates yaml spec against schema')
    .argument('<path-to-dir>', 'Path to directory containing yaml spec files')
    .action((pathToDir: string, _) => {
        pathToDir = path.join(process.env.PWD!, pathToDir)
        const result = validateAction(pathToDir);
        printActionResult(program, result)
    });
program
    .command('generate')
    .description('Generates code using tech-spec')
    .addArgument(
        new Argument('<type>', 'Type of generated code').choices(['validators'])
    )
    .argument('<path-to-dir>', 'Path to directory containing yaml spec files')
    .argument('<output-file>', 'Path to output file')
    .action((genType: 'validators', pathToDir: string, outputFile: string) => {
        pathToDir = path.join(process.env.PWD!, pathToDir);
        outputFile = path.join(process.env.PWD!, outputFile);
        const result = generateAction(genType, pathToDir, outputFile);
        printActionResult(program, result);
    });
program
    .command('gen-diff')
    .description('Finds the difference between tech-spec and generated validators')
    .addArgument(
        new Argument('<type>', 'Type of generated code').choices(['validators'])
    )
    .argument('<path-to-dir>', 'Path to directory containing yaml spec files')
    .argument('<output-file>', 'Path to file with validators')
    .action((genType: 'validators', pathToDir: string, outputFile: string) => {
        pathToDir = path.join(process.env.PWD!, pathToDir);
        outputFile = path.join(process.env.PWD!, outputFile);
        const result = genDiffAction(genType, pathToDir, outputFile);
        printActionResult(program, result)
    })
program.parse();