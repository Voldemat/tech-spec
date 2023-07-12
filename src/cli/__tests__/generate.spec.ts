/* eslint max-lines-per-function: 0 */
import fs from 'fs'
import { v4 as uuid4 } from 'uuid'
import os from 'os'
import path from 'path'
import { runCLI } from './conftest'
import {
    formExpectedCode,
    formYamlContent,
    themeExpectedCode,
    themeYamlContent
} from './snippets'

describe('CLI:generate', () => {
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
    beforeAll(() => {
        fs.mkdirSync(techSpecFolder)
        fs.mkdirSync(outputFolder)
    })
    afterAll(() => {
        fs.rm(techSpecFolder, {
            recursive: true
        }, (e) => { if (e !== null) console.error(e) })
        fs.rm(outputFolder, {
            recursive: true
        }, (e) => { if (e !== null) console.error(e) })
    })
    it(
        'should return green "❇️ Code is successfully generated" message',
        async () => {
            saveThemeFile(themeYamlContent)
            saveFormFile(formYamlContent)
            const output = await runCLI(
                `generate ${techSpecFolder} ${outputFolder}`
            )
            expect(output.failed).toBe(false)
            expect(output.exitCode).toBe(0)
            expect(output.stdout).toBe(
                '\u001b[2K\u001b[1G❇️  \u001b[92m' +
                'Code is successfully generated\u001b[39m'
            )
            expect(fs.existsSync(formPath)).toBe(true)
            expect(fs.existsSync(themePath)).toBe(true)
            const formCode = fs.readFileSync(formPath, 'utf-8')
            expect(formCode).toBe(formExpectedCode)
            const themeCode = fs.readFileSync(themePath, 'utf-8')
            expect(themeCode).toBe(themeExpectedCode)
        }
    )
})
