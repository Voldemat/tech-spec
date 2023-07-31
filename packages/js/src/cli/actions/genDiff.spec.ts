/* eslint max-lines-per-function: 0 */
import { GenDiffAction } from './genDiff'

describe('genDiffActon', () => {
    let fsUtils: { readGeneratedFiles: jest.Mock }
    let specUtils: { getValidatedSpec: jest.Mock, isEqual: jest.Mock }
    let astFactory: { fromSpec: jest.Mock, fromCode: jest.Mock }
    beforeEach(() => {
        fsUtils = { readGeneratedFiles: jest.fn() }
        specUtils = {
            getValidatedSpec: jest.fn(() => ({ ok: true, data: [] })),
            isEqual: jest.fn(() => true)
        }
        astFactory = { fromSpec: jest.fn(), fromCode: jest.fn() }
    })
    it('Test successfull result', () => {
        const action = new GenDiffAction(
            fsUtils as any,
            specUtils as any,
            astFactory as any
        )
        const pathToDir = './check-dir'
        const outputDir = './another/'

        const result = action.run(pathToDir, outputDir)
        expect(result.isError).toBe(false)
        expect(result.messages).toStrictEqual(
            ['Generated code is consistent with spec']
        )
        expect(astFactory.fromCode.mock.calls.length).toBe(1)
        expect(astFactory.fromSpec.mock.calls.length).toBe(1)
    })
})
