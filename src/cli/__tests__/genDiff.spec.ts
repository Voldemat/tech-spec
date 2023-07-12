/* eslint max-lines-per-function: 0 */
import fs from 'fs'
import { v4 as uuid4 } from 'uuid'
import util from 'util'
import os from 'os'
import path from 'path'
import { runCLI } from './conftest'

const themeYamlContent = `
type: theme
metadata:
    name: light
spec:
    colors:
        check: rgba(255, 255, 255, 255)
`
const formYamlContent = `
type: form
metadata:
  name: 'Registration'
spec:
  login:
    required: true
    regex: '^[\\w_]{4,100}$'
    errorMessage: null

  password:
    required: true
    regex: '^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9]){5;150}$'
    errorMessage: 'Invalid'

  tel:
    required: true
    regex: '^\\d{3}-\\d{3}-\\d{4}$'
    errorMessage: 'Invalid'

  name:
      required: false
      regex: ` +
      '^([а-яА-ЯёЁa-zA-Z]+ [а-яА-ЯёЁa-zA-Z]? ' +
      '[а-яА-ЯёЁa-zA-Z]? [\\-\\s]*){1;150}$' + `
      errorMessage: null
`
const formExpectedCode = `export const RegistrationForm = {
  login: {
    required: true,
    regex: ` + util.inspect('"^[\\w_]{4,100}$"').slice(1).slice(0, -1) + `,
    errorMessage: null
  },
  password: {
    required: true,
    regex: "^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9]){5;150}$",
    errorMessage: "Invalid"
  },
  tel: {
    required: true,
    regex: ` +
    util.inspect('"^\\d{3}-\\d{3}-\\d{4}$"').slice(1).slice(0, -1) +
    `,
    errorMessage: "Invalid"
  },
  name: {
    required: false,
    regex: ` +
    util.inspect(
        '"^([а-яА-ЯёЁa-zA-Z]+ [а-яА-ЯёЁa-zA-Z]? ' +
        '[а-яА-ЯёЁa-zA-Z]? [\\-\\s]*){1;150}$"'
    ).slice(1).slice(0, -1) + `,
    errorMessage: null
  }
};
`
const themeExpectedCode = `export const design = {
  colors: {
    check: {
      light: "rgba(255, 255, 255, 255)"
    }
  }
};
`
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
        fs.rm(techSpecFolder, {
            recursive: true
        }, (e) => { if (e !== null) console.error(e) })
        fs.rm(outputFolder, {
            recursive: true
        }, (e) => { if (e !== null) console.error(e) })
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
