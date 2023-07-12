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
