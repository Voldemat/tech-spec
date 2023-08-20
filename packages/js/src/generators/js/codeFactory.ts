import * as astring from 'astring'
import { getEntries } from '../../utils'
import { type SpecCode, type TechSpecAst } from '../types'

export class CodeFactory {
    generate (ast: TechSpecAst): SpecCode {
        return getEntries(ast)
            .filter(
                (entry): entry is [
                    keyof TechSpecAst, Record<string, any>
                ] => {
                    return entry?.[1] !== undefined
                }
            )
            .reduce<SpecCode>(
                (obj, [type, ast]) => {
                    if (ast !== undefined) {
                        obj[type] = astring.generate(ast as astring.Node)
                    }
                    return obj
                },
                {}
            )
    }
}
