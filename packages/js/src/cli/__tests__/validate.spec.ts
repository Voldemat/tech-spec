/* eslint max-lines-per-function: 0 */
import fs from 'fs'
import { v4 as uuid4 } from 'uuid'
import os from 'os'
import path from 'path'
import { removeDir, runCLI } from './conftest'

describe('CLI:validate', () => {
    const techSpecFolder = path.join(os.tmpdir(), 'tech-spec-' + uuid4())
    let designSystemYamlContent = `
    type: DesignSystem
    metadata:
        name: main
    spec:
        colors:
            check:
                light: rgba(255, 255, 255, 255)
    `
    function saveDesignSystemFile (content: string): void {
        fs.writeFileSync(
            path.join(techSpecFolder, 'main-design.tech-spec.yaml'),
            content
        )
    }
    beforeAll(() => {
        fs.mkdirSync(techSpecFolder)
    })
    afterAll(() => {
        removeDir(techSpecFolder)
    })
    it('should return green "❇️ Spec is valid" message', async () => {
        saveDesignSystemFile(designSystemYamlContent)
        const output = await runCLI(`validate ${techSpecFolder}`)
        expect(output.failed).toBe(false)
        expect(output.exitCode).toBe(0)
        expect(output.stdout).toBe(
            '\u001b[2K\u001b[1G❇️  \u001b[92mSpec is valid\u001b[39m'
        )
    })
    it('Should return YamlParsingError', async () => {
        designSystemYamlContent = `
        type: DesignSystem
        metadata:
            name: main
            adsasd
        spec:
            colors:
                check:
                    light: rgba(255, 255, 255, 255)
        `
        saveDesignSystemFile(designSystemYamlContent)
        const output = await runCLI(`validate ${techSpecFolder}`)
        expect(output.failed).toBe(true)
        expect(output.exitCode).toBe(1)
        expect(output.stdout).toBe('\u001b[2K\u001b[1G')
        expect(output.stderr).toBe(
            '🚨 \u001b[91mYamlParsingError: ' +
            techSpecFolder +
            '/main-design.tech-spec.yaml' +
            '\u001b[39m\n\u001b[91m\u001b[39m\n\u001b[91m' +
            'Reason: can not read an implicit mapping pair; a colon is missed' +
            '\u001b[39m\n\u001b[91m\u001b[39m\n\u001b[91m ' +
            '2 |         type: DesignSystem\u001b[39m\n\u001b[91m ' +
            '3 |         metadata:\u001b[39m\n\u001b[91m ' +
            '4 |             name: main\u001b[39m\n\u001b[91m ' +
            '5 |             adsasd\u001b[39m\n\u001b[91m' +
            '-----------------------^\u001b[39m\n\u001b[91m ' +
            '6 |         spec:\u001b[39m\n\u001b[91m ' +
            '7 |             colors:\u001b[39m'
        )
    })
})
