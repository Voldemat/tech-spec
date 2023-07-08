import fs from 'fs'
import { generate } from 'astring'
import { type ActionResult } from '../../types'
import {
    isDirExists,
    loadSpecFilesData,
    validateSpecArray
} from '../utils'
import { type Node } from 'acorn'
import { generateJSAstTreeFromSpecArray } from '../../generators/js'
import { type TechSpec } from '../../spec/types'

export function generateAction (
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
    const specArray = loadSpecFilesData(pathToDir)
    const error = validateSpecArray(specArray)
    if (error !== null) {
        return {
            isError: true,
            message: error
        }
    }
    const ast = generateJSAstTreeFromSpecArray(specArray as TechSpec[])
    const sourceCode = generate(ast as Node)
    fs.writeFileSync(outputFile, sourceCode)
    return {
        isError: false,
        message: 'Code is successfully generated'
    }
}
