/* eslint max-lines-per-function: 0 */
import { GenDiffAction } from './genDiff'

describe('genDiffActon', () => {
    let fsUtils: { readGeneratedFiles: jest.Mock }
    let specUtils: { getValidatedSpec: jest.Mock, isEqual: jest.Mock }
    let astFactory: { fromCode: jest.Mock }
    let specGenerator: { fromAst: jest.Mock }
    beforeEach(() => {
        fsUtils = { readGeneratedFiles: jest.fn() }
        specUtils = {
            getValidatedSpec: jest.fn(() => ({ ok: true, data: [] })),
            isEqual: jest.fn(() => true)
        }
        astFactory = { fromCode: jest.fn() }
        specGenerator = { fromAst: jest.fn() }
    })
    it('Test successfull result', () => {
        const action = new GenDiffAction(
            fsUtils as any,
            specUtils as any,
            astFactory as any,
            specGenerator as any
        )
        const pathToDir = './check-dir'
        const outputDir = './another/'

        const result = action.run(pathToDir, outputDir)
        expect(result.isError).toBe(false)
        expect(result.messages).toStrictEqual(
            ['Generated code is consistent with spec']
        )
        expect(astFactory.fromCode.mock.calls.length).toBe(1)
    })
})
