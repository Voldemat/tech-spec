#! /usr/bin/env node

import { Command } from 'commander'
import { validateCommand } from './commands/validate';
import { generateCommand } from './commands/generate';
import { generateDiffCommand } from './commands/generateDiffCommand';

const program = (
    new Command()
        .addCommand(validateCommand)
        .addCommand(generateCommand)
        .addCommand(generateDiffCommand)
)
try {
    program.parse();
} catch(e: any) {
    console.error(e.message);
    process.exit(1);
}