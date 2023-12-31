import fs from 'fs'
import path from 'path'
import type { SpecCode } from '../generators/types'
import type { TechSpec } from '../spec/types'
import { FILE_SPEC_EXTENSION } from '../types'

export class FsUtils {
    isDirExists (pathToDir: string): boolean {
        return fs.existsSync(pathToDir)
    }

    readFile (filePath: string): string {
        return fs.readFileSync(filePath, 'utf-8')
    }

    writeToFile (filePath: string, content: string): void {
        fs.writeFileSync(filePath, content)
    }

    toAbsolutePath (relativePath: string): string {
        if (relativePath.startsWith('/')) return relativePath
        return path.join(process.cwd(), relativePath)
    }

    getTypeFromFilePath (filepath: string): TechSpec['type'] | null {
        const filename = path.parse(filepath).name
        switch (filename) {
        case 'forms':
            return 'form'
        case 'designs':
            return 'DesignSystem'
        case 'features':
            return 'feature'
        case 'types':
            return 'type'
        default:
            return null
        }
    }

    genCodeFileName (outpurDir: string, type: TechSpec['type']): string {
        let filename: string
        switch (type) {
        case 'form':
            filename = 'forms'
            break
        case 'DesignSystem':
            filename = 'designs'
            break
        case 'feature':
            filename = 'features'
            break
        case 'type':
            filename = 'types'
            break
        default:
            // eslint-disable-next-line
            throw new Error(`Unhandled spec type ${type}`)
        }
        return path.join(outpurDir, filename + '.ts')
    }

    findCodeFiles (pathToDir: string): string[] {
        return this.findFiles(pathToDir, '.ts')
    }

    findSpecFiles (pathToDir: string): string[] {
        return this.findFiles(pathToDir, FILE_SPEC_EXTENSION)
    }

    writeGeneratedFiles (
        outputDir: string,
        files: Array<[TechSpec['type'], string | undefined]>
    ): void {
        outputDir = this.toAbsolutePath(outputDir)
        if (!this.isDirExists(outputDir)) this.createDir(outputDir)
        for (const [type, code] of files) {
            if (code === undefined) continue
            this.writeToFile(
                this.genCodeFileName(outputDir, type),
                code
            )
        }
    }

    readGeneratedFiles (
        dir: string
    ): SpecCode {
        dir = this.toAbsolutePath(dir)
        return this.findCodeFiles(dir)
            .reduce<Partial<SpecCode>>(
                (obj, filepath) => {
                    const code = this.readFile(filepath)
                    const type = this.getTypeFromFilePath(filepath)
                    if (type !== null) obj[type] = code
                    return obj
                },
                {}
            ) as SpecCode
    }

    findFiles (pathToDir: string, endsWith: string): string[] {
        const filePaths: string[] = []
        fs.readdirSync(pathToDir).forEach(filePath => {
            const fullPath = path.join(pathToDir, filePath)
            const stat = fs.lstatSync(fullPath)
            if (stat.isDirectory()) {
                filePaths.push(...this.findFiles(fullPath, endsWith))
            } else if (filePath.endsWith(endsWith)) {
                filePaths.push(fullPath)
            }
        })
        return filePaths
    }

    createDir (dir: string): void {
        fs.mkdirSync(dir, { recursive: true })
    }
}
