import { loadAll, type YAMLException } from 'js-yaml'
import type { FsUtils } from '../cli/fsUtils'
import type { ILoaderResult, ILoader } from '../types'

export class YamlLoader implements ILoader {
    constructor (private readonly fsUtils: FsUtils) {}
    load (filepath: string): ILoaderResult {
        const content = this.fsUtils.readFile(filepath)
        try {
            return {
                data: loadAll(content) as Array<Record<string, any>>,
                error: null
            }
        } catch (error: any) {
            const e: YAMLException = error
            return {
                data: null,
                error: (
                    `YamlParsingError: ${filepath}\n\n` +
                    `Reason: ${e.reason}\n\n${e.mark.snippet}`
                )
            }
        }
    }
}
