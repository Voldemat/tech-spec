import { GenDiffAction } from './genDiff'

describe('genDiffActon', () => {
    let fsUtils: {
        toAbsolutePath: jest.Mock
        isDirExists: jest.Mock
        readFile: jest.Mock
    }
    let yamlLoader: { load: jest.Mock }
    let specUtils: { validateSpecArray: jest.Mock, isEqual: jest.Mock }
    let specFinder: { findFiles: jest.Mock }
    let astFactory: {
        generateJSAstTreeFromSpecArray: jest.Mock
        generateJSAstTreeFromCode: jest.Mock
    }
    beforeEach(() => {
        fsUtils = {
            toAbsolutePath: jest.fn(path => path),
            isDirExists: jest.fn(() => true),
            readFile: jest.fn()
        }
        yamlLoader = { load: jest.fn(() => ({})) }
        specUtils = {
            validateSpecArray: jest.fn(() => null),
            isEqual: jest.fn(() => true)
        }
        specFinder = {
            findFiles: jest.fn(() => (['a.tech-spec.yaml', 'b.tech-spec.yaml']))
        }
        astFactory = {
            generateJSAstTreeFromSpecArray: jest.fn(),
            generateJSAstTreeFromCode: jest.fn()
        }
    })
    it('Test successfull result', () => {
        const action = new GenDiffAction(
            fsUtils as any,
            yamlLoader as any,
            specUtils as any,
            specFinder as any,
            astFactory as any
        )
        const pathToDir = './check-dir'
        const outputFile = './here-js.ts'

        const result = action.run('validators', pathToDir, outputFile)
        expect(result.isError).toBe(false)
        expect(result.message).toBe('Validators are consistent with spec')
        expect(fsUtils.toAbsolutePath.mock.calls.length).toBe(2)
        expect(fsUtils.toAbsolutePath.mock.calls[0]).toStrictEqual([pathToDir])
        expect(fsUtils.toAbsolutePath.mock.calls[1]).toStrictEqual([outputFile])
        expect(specFinder.findFiles.mock.calls.length).toBe(1)
        expect(specFinder.findFiles.mock.lastCall).toStrictEqual([pathToDir])
        expect(fsUtils.readFile.mock.calls.length).toBe(3)
        expect(fsUtils.readFile.mock.calls[2]).toStrictEqual([outputFile])
        expect(yamlLoader.load.mock.calls.length).toBe(2)
        expect(specUtils.validateSpecArray.mock.calls.length).toBe(1)
        expect(astFactory.generateJSAstTreeFromCode.mock.calls.length).toBe(1)
        expect(
            astFactory.generateJSAstTreeFromSpecArray.mock.calls.length
        ).toBe(1)
    })
})
