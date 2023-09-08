/* eslint max-lines-per-function: 0 */
import fs from 'fs'
import { v4 as uuid4 } from 'uuid'
import os from 'os'
import path from 'path'
import { removeDir, runCLI } from './conftest'
import {
    designSystemContent,
    designSystemExpectedCode,
    formExpectedCode,
    formYamlContent,
    loginFieldContent,
    passwordFieldContent
} from './snippets'

describe('CLI:gen-diff', () => {
    const techSpecFolder = path.join(os.tmpdir(), 'tech-spec-' + uuid4())
    const outputFolder = path.join(os.tmpdir(), 'tech-spec-output-' + uuid4())
    const formPath = path.join(outputFolder, 'forms.ts')
    const designSystemsPath = path.join(outputFolder, 'designs.ts')

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
    function saveFormCodeFile (content: string): void {
        fs.writeFileSync(formPath, content)
    }
    function saveDesignSystemCodeFile (content: string): void {
        fs.writeFileSync(designSystemsPath, content)
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
            saveDesignSystemFile(designSystemContent)
            saveFormFile(formYamlContent)
            saveFormCodeFile(formExpectedCode)
            saveDesignSystemCodeFile(designSystemExpectedCode)
            saveLoginFieldFile(loginFieldContent)
            savePasswordFieldFile(passwordFieldContent)
            const output = await runCLI(
                `gen-diff ${techSpecFolder} ${outputFolder}`
            )
            expect(output.stderr).toBe('')
            expect(output.failed).toBe(false)
            expect(output.exitCode).toBe(0)
            expect(output.stdout).toBe(
                '\u001b[2K\u001b[1G❇️  \u001b[92m' +
                'Generated code is consistent with spec\u001b[39m'
            )
        }
    )
})
