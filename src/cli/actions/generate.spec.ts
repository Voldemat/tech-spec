/* eslint max-lines-per-function: 0 */
import { GenerateAction } from './generate'

function buildGenerateAction (
    fsUtils: any,
    specUtils: any,
    astFactory: any,
    codeFactory: any
): GenerateAction {
    return new GenerateAction(
        fsUtils,
        specUtils,
        astFactory,
        codeFactory
    )
}
describe('GenerateAction', () => {
    let fsUtils: { writeGeneratedFiles: jest.Mock }
    let specUtils: { getValidatedSpec: jest.Mock }
    let astFactory: { fromSpec: jest.Mock }
    let codeFactory: { generate: jest.Mock }

    beforeEach(() => {
        specUtils = {
            getValidatedSpec: jest.fn(() => ({ ok: true, data: [] }))
        }
        fsUtils = { writeGeneratedFiles: jest.fn() }
        astFactory = { fromSpec: jest.fn() }
        codeFactory = { generate: jest.fn(() => ({})) }
    })
    it('Test successful result', () => {
        const action = buildGenerateAction(
            fsUtils, specUtils, astFactory, codeFactory
        )
        const result = action.run('./somethere/', './another/')
        expect(result.isError).toBe(false)
        expect(result.messages).toStrictEqual(
            ['Code is successfully generated']
        )
        expect(astFactory.fromSpec.mock.calls.length).toBe(1)
    })
})
