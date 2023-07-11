import { ValidateAction } from './validate'

describe('ValidateAction', () => {
    let fsUtils: {
        toAbsolutePath: jest.Mock
        isDirExists: jest.Mock
        writeToFile: jest.Mock
        findSpecFiles: jest.Mock
    }
    let yamlLoader: { load: jest.Mock }
    let specValidator: { validate: jest.Mock }

    beforeEach(() => {
        fsUtils = {
            toAbsolutePath: jest.fn(),
            isDirExists: jest.fn(() => true),
            writeToFile: jest.fn(),
            findSpecFiles: jest.fn(() => (['some.ts', 'some2.ts']))
        }
        yamlLoader = { load: jest.fn(() => ({ data: {}, error: null })) }
        specValidator = { validate: jest.fn(() => null) }
    })
    it('Test successful result', () => {
        const action = new ValidateAction(
            fsUtils as any,
            yamlLoader as any,
            specValidator as any
        )
        const pathToDir = './somethere/'
        const result = action.run(pathToDir)
        expect(result.isError).toBe(false)
        expect(result.messages).toStrictEqual(['Spec is valid'])
        expect(fsUtils.toAbsolutePath.mock.calls.length).toBe(1)
        expect(fsUtils.toAbsolutePath.mock.calls[0]).toStrictEqual([pathToDir])
        expect(fsUtils.findSpecFiles.mock.calls.length).toBe(1)
        expect(yamlLoader.load.mock.calls.length).toBe(2)
        expect(specValidator.validate.mock.calls.length).toBe(2)
    })
})
