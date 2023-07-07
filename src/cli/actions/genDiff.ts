import fs from 'fs'
import lodash from 'lodash'
import acorn from 'acorn'
import {
    generateJSAstTreeFromSpecArray,
    isDirExists,
    loadSpec,
    validateSpecArray
} from '../utils'
import { type ActionResult } from '../../types'

function nestedOmit (
    obj: Record<string, any>, omitKeys: string[]
): Record<string, any> {
    const newObj: Record<string, any> = {}
    Object.entries(obj).forEach(([key, value]: [string, any]) => {
        if (omitKeys.includes(key)) {
            return
        }
        if (value instanceof Array) {
            newObj[key] = value.map((v) => nestedOmit(v, omitKeys))
        } else if (value instanceof Object) {
            newObj[key] = nestedOmit(value, omitKeys)
        } else {
            newObj[key] = value
        }
    })
    return newObj
}
export function genDiffAction (
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
    const specArray = loadSpec(pathToDir)
    const error = validateSpecArray(specArray)
    if (error !== null) {
        return {
            isError: true,
            message: error
        }
    }
    let specAst: any = generateJSAstTreeFromSpecArray(specArray)
    specAst = nestedOmit(specAst, ['sourceType'])
    const currentSourceCode = fs.readFileSync(outputFile, 'utf-8')
    let currentAst: any = acorn.parse(
        currentSourceCode,
        { ecmaVersion: 7, ranges: false, sourceType: 'module' }
    )
    currentAst = nestedOmit(
        currentAst,
        [
            'specifiers',
            'source',
            'sourceType',
            'start',
            'end',
            'method',
            'shorthand',
            'computed',
            'raw'
        ]
    )
    if (lodash.isEqual(specAst, currentAst)) {
        return {
            isError: false,
            message: 'Validators are consistent with spec'
        }
    }
    return {
        isError: true,
        message: 'Validators are not consistent with spec'
    }
}
