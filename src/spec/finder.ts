import fs from 'fs'
import path from 'path'
import { FILE_SPEC_EXTENSION } from '../types'

export class SpecFinder {
    findFiles (pathToDir: string): string[] {
        let filePaths: string[] = []
        fs.readdirSync(pathToDir).forEach(filePath => {
            const fullPath = path.join(pathToDir, filePath)
            const stat = fs.lstatSync(fullPath)
            if (stat.isDirectory()) {
                filePaths = filePaths.slice(filePath.indexOf(filePath), 1)
                filePaths.push(...this.findFiles(fullPath))
            } else if (filePath.endsWith(FILE_SPEC_EXTENSION)) {
                filePaths.push(fullPath)
            }
        })
        return filePaths
    }
}
