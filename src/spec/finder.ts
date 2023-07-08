import fs from 'fs'
import path from 'path'
import { FILE_SPEC_EXTENSION } from '../types'

export function findFiles (pathToDir: string): string[] {
    let filePaths: string[] = []
    fs.readdirSync(pathToDir).forEach(filePath => {
        const fullPath = path.join(pathToDir, filePath)
        const stat = fs.lstatSync(fullPath)
        if (stat.isDirectory()) {
            filePaths = filePaths.slice(filePath.indexOf(filePath), 1)
            filePaths.push(...findFiles(fullPath))
        } else if (filePath.endsWith(FILE_SPEC_EXTENSION)) {
            filePaths.push(fullPath)
        }
    })
    return filePaths
}
