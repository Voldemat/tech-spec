import { ValidateAction } from './validate'

describe('ValidateAction', () => {
    let fsUtils: {
        toAbsolutePath: jest.Mock
        isDirExists: jest.Mock
        readFile: jest.Mock
        writeToFile: jest.Mock
    }
    let yamlLoader: { load: jest.Mock }
    let specUtils: { validateSpecArray: jest.Mock }
    let specFinder: { findFiles: jest.Mock }

    beforeEach(() => {
        fsUtils = {
            toAbsolutePath: jest.fn(),
            isDirExists: jest.fn(() => true),
            readFile: jest.fn(() => 'content'),
            writeToFile: jest.fn()
        }
        yamlLoader = { load: jest.fn() }
        specUtils = { validateSpecArray: jest.fn(() => null) }
        specFinder = {
            findFiles: jest.fn(() => (['some.ts', 'some2.ts']))
        }
    })
    it('Test successful result', () => {
        const action = new ValidateAction(
            fsUtils as any,
            specFinder as any,
            yamlLoader as any,
            specUtils as any
        )
        const pathToDir = './somethere/'
        const result = action.run(pathToDir)
        expect(result.isError).toBe(false)
        expect(result.message).toBe('Spec is valid')
        expect(fsUtils.toAbsolutePath.mock.calls.length).toBe(1)
        expect(fsUtils.toAbsolutePath.mock.calls[0]).toStrictEqual([pathToDir])
        expect(specFinder.findFiles.mock.calls.length).toBe(1)
        expect(fsUtils.readFile.mock.calls.length).toBe(2)
        expect(yamlLoader.load.mock.calls.length).toBe(2)
        expect(specUtils.validateSpecArray.mock.calls.length).toBe(1)
    })
})
