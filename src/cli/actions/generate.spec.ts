import { GenerateAction } from './generate'

describe('GenerateAction', () => {
    let fsUtils: {
        toAbsolutePath: jest.Mock
        isDirExists: jest.Mock
        readFile: jest.Mock
        writeToFile: jest.Mock
        findSpecFiles: jest.Mock
    }
    let yamlLoader: { load: jest.Mock }
    let specUtils: { validateSpecArray: jest.Mock }
    let astFactory: {
        fromSpec: jest.Mock
    }
    let codeFactory: { generate: jest.Mock }

    beforeEach(() => {
        fsUtils = {
            toAbsolutePath: jest.fn(),
            isDirExists: jest.fn(() => true),
            readFile: jest.fn(() => 'content'),
            writeToFile: jest.fn(),
            findSpecFiles: jest.fn(() => (['some.ts', 'some2.ts']))
        }
        yamlLoader = { load: jest.fn() }
        specUtils = { validateSpecArray: jest.fn(() => null) }
        astFactory = {
            fromSpec: jest.fn()
        }
        codeFactory = {
            generate: jest.fn(() => ({}))
        }
    })
    it('Test successful result', () => {
        const action = new GenerateAction(
            fsUtils as any,
            yamlLoader as any,
            specUtils as any,
            astFactory as any,
            codeFactory as any
        )
        const pathToDir = './somethere/'
        const outputDir = './another/'
        const result = action.run(pathToDir, outputDir)
        expect(result.isError).toBe(false)
        expect(result.message).toBe('Code is successfully generated')
        expect(fsUtils.toAbsolutePath.mock.calls.length).toBe(2)
        expect(fsUtils.toAbsolutePath.mock.calls[0]).toStrictEqual([pathToDir])
        expect(fsUtils.toAbsolutePath.mock.calls[1]).toStrictEqual([outputDir])
        expect(fsUtils.findSpecFiles.mock.calls.length).toBe(1)
        expect(fsUtils.readFile.mock.calls.length).toBe(2)
        expect(yamlLoader.load.mock.calls.length).toBe(2)
        expect(specUtils.validateSpecArray.mock.calls.length).toBe(1)
        expect(
            astFactory.fromSpec.mock.calls.length
        ).toBe(1)
    })
})