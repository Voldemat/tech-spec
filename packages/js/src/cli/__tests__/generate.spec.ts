/* eslint max-lines-per-function: 0 */
import fs from 'fs'
import { v4 as uuid4 } from 'uuid'
import os from 'os'
import path from 'path'
import { runCLI } from './conftest'
import {
    designSystemContent,
    designSystemExpectedCode,
    formExpectedCode,
    formYamlContent,
    loginFieldContent,
    passwordFieldContent
} from './snippets'

describe('CLI:generate', () => {
    const techSpecFolder = path.join(os.tmpdir(), 'tech-spec-' + uuid4())
    const outputFolder = path.join(os.tmpdir(), 'tech-spec-output-' + uuid4())
    const formPath = path.join(outputFolder, 'forms.ts')
    const designSystemPath = path.join(outputFolder, 'designs.ts')

    function saveDesignSystemFile (content: string): void {
        fs.writeFileSync(
            path.join(techSpecFolder, 'main-design.tech-spec.yaml'),
            content
        )
    }

    function saveFormFile (content: string): void {
        fs.writeFileSync(
            path.join(techSpecFolder, 'registration-form.tech-spec.yaml'),
            content
        )
    }
    function saveLoginFieldFile (content: string): void {
        fs.writeFileSync(
            path.join(techSpecFolder, 'login.tech-spec.yaml'),
            content
        )
    }
    function savePasswordFieldFile (content: string): void {
        fs.writeFileSync(
            path.join(techSpecFolder, 'password.tech-spec.yaml'),
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
            saveDesignSystemFile(designSystemContent)
            saveFormFile(formYamlContent)
            saveLoginFieldFile(loginFieldContent)
            savePasswordFieldFile(passwordFieldContent)
            const output = await runCLI(
                `generate ${techSpecFolder} ${outputFolder}`
            )
            expect(output.stderr).toBe('')
            expect(output.failed).toBe(false)
            expect(output.exitCode).toBe(0)
            expect(output.stdout).toBe(
                '\u001b[2K\u001b[1G❇️  \u001b[92m' +
                'Code is successfully generated\u001b[39m'
            )
            expect(fs.existsSync(formPath)).toBe(true)
            expect(fs.existsSync(designSystemPath)).toBe(true)
            const formCode = fs.readFileSync(formPath, 'utf-8')
            expect(formCode).toBe(formExpectedCode)
            const designSystemCode = fs.readFileSync(designSystemPath, 'utf-8')
            expect(designSystemCode).toBe(designSystemExpectedCode)
        }
    )
})
