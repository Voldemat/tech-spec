/* eslint max-lines-per-function: 0 */
import fs from 'fs'
import { v4 as uuid4 } from 'uuid'
import os from 'os'
import path from 'path'
import { removeDir, runCLI } from './conftest'
import {
    formExpectedCode,
    formYamlContent,
    themeExpectedCode,
    themeYamlContent
} from './snippets'

describe('CLI:gen-diff', () => {
    const techSpecFolder = path.join(os.tmpdir(), 'tech-spec-' + uuid4())
    const outputFolder = path.join(os.tmpdir(), 'tech-spec-output-' + uuid4())
    const formPath = path.join(outputFolder, 'form.ts')
    const themePath = path.join(outputFolder, 'theme.ts')

    function saveThemeFile (content: string): void {
        fs.writeFileSync(
            path.join(techSpecFolder, 'light-theme.tech-spec.yaml'),
            content
        )
    }

    function saveFormFile (content: string): void {
        fs.writeFileSync(
            path.join(techSpecFolder, 'registration-form.tech-spec.yaml'),
            content
        )
    }
    function saveFormCodeFile (content: string): void {
        fs.writeFileSync(formPath, content)
    }
    function saveThemeCodeFile (content: string): void {
        fs.writeFileSync(themePath, content)
    }
    beforeAll(() => {
        fs.mkdirSync(techSpecFolder)
        fs.mkdirSync(outputFolder)
    })
    afterAll(() => {
        removeDir(techSpecFolder)
        removeDir(outputFolder)
    })
    it(
        'should return green ' +
        '"❇️ Generated code is consistent with spec" message',
        async () => {
            saveThemeFile(themeYamlContent)
            saveFormFile(formYamlContent)
            saveFormCodeFile(formExpectedCode)
            saveThemeCodeFile(themeExpectedCode)
            const output = await runCLI(
                `gen-diff ${techSpecFolder} ${outputFolder}`
            )
            expect(output.failed).toBe(false)
            expect(output.exitCode).toBe(0)
            expect(output.stdout).toBe(
                '\u001b[2K\u001b[1G❇️  \u001b[92m' +
                'Generated code is consistent with spec\u001b[39m'
            )
        }
    )
})
