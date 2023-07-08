import { load } from 'js-yaml'
import { type ILoader } from '../spec/types'

export class YamlLoader implements ILoader {
    load (content: string): Record<string, any> {
        return load(content) as Record<string, any>
    }
}
