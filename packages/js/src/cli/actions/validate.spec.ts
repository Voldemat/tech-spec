/* eslint max-lines-per-function: 0 */
import { ValidateAction } from './validate'

interface SpecUtilsMock {
    getValidatedSpec: jest.Mock
}

describe('ValidateAction', () => {
    let specUtils: SpecUtilsMock

    beforeEach(() => {
        specUtils = {
            getValidatedSpec: jest.fn(() => ({ ok: true, data: [] }))
        }
    })
    it('Test successful result', () => {
        const action = new ValidateAction(specUtils as any)
        const pathToDir = './somethere/'
        const result = action.run(pathToDir)
        expect(result.isError).toBe(false)
        expect(result.messages).toStrictEqual(['Spec is valid'])
        expect(specUtils.getValidatedSpec.mock.calls.length).toBe(1)
    })
})
