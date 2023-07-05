import fs from 'fs';
import path from 'path';
import { generate } from 'astring';
import { ActionResult } from "../../types";
import { generateJSAstTreeFromSpecArray, isDirExists, loadSpec, validateSpecArray } from "../utils";

export function generateAction(
    genType: 'validators',
    pathToDir: string,
    outputFile: string
): ActionResult {
    if (!isDirExists(pathToDir)) {
        return {
            isError: true,
            message: 'Provided output directory does not exists'
        }
    }
    const specArray = loadSpec(pathToDir);
    const error = validateSpecArray(specArray)
    if (error !== null) {
        return {
            isError: true,
            message: error
        }
    }
    const ast = generateJSAstTreeFromSpecArray(specArray);
    const sourceCode = generate(ast);
    fs.writeFileSync(outputFile, sourceCode)
    return {
        isError: false,
        message: 'Code is successfully generated'   
    }
}