import { Argument, Command } from "commander";
import { generateAction } from "../actions/generate";
import { buildActionCallback, toAbsolutePath } from "../utils";

export const generateCommand = (
    new Command('generate')
        .description('Generates code using tech-spec')
        .addArgument(
            new Argument('<type>', 'Type of generated code').choices(['validators'])
        )
        .argument('<path-to-dir>', 'Path to directory containing yaml spec files')
        .argument('<output-file>', 'Path to output file')
        .action(
            buildActionCallback(
                (genType: 'validators', pathToDir: string, outputFile: string) => {
                    return generateAction(
                        genType,
                        toAbsolutePath(pathToDir),
                        toAbsolutePath(outputFile)
                    );
                }
            )
        )
)