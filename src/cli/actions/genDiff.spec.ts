import { GenDiffAction } from './genDiff'

describe('genDiffActon', () => {
    let fsUtils: {
        toAbsolutePath: jest.Mock
        isDirExists: jest.Mock
        readFile: jest.Mock
        findSpecFiles: jest.Mock
        findCodeFiles: jest.Mock
        getTypeFromFilePath: jest.Mock
    }
    let yamlLoader: { load: jest.Mock }
    let specUtils: { validateSpecArray: jest.Mock, isEqual: jest.Mock }
    let astFactory: {
        fromSpec: jest.Mock
        fromCode: jest.Mock
    }
    beforeEach(() => {
        fsUtils = {
            toAbsolutePath: jest.fn(path => path),
            isDirExists: jest.fn(() => true),
            readFile: jest.fn(),
            findSpecFiles: jest.fn(
                () => (['a.tech-spec.yaml', 'b.tech-spec.yaml'])
            ),
            findCodeFiles: jest.fn(() => (['a.ts', 'b.ts'])),
            getTypeFromFilePath: jest.fn()
        }
        yamlLoader = { load: jest.fn(() => ({})) }
        specUtils = {
            validateSpecArray: jest.fn(() => null),
            isEqual: jest.fn(() => true)
        }
        astFactory = {
            fromSpec: jest.fn(),
            fromCode: jest.fn()
        }
    })
    it('Test successfull result', () => {
        const action = new GenDiffAction(
            fsUtils as any,
            yamlLoader as any,
            specUtils as any,
            astFactory as any
        )
        const pathToDir = './check-dir'
        const outputDir = './another/'

        const result = action.run(pathToDir, outputDir)
        expect(result.isError).toBe(false)
        expect(result.message).toBe('Validators are consistent with spec')
        expect(fsUtils.toAbsolutePath.mock.calls.length).toBe(2)
        expect(fsUtils.toAbsolutePath.mock.calls[0]).toStrictEqual([pathToDir])
        expect(fsUtils.toAbsolutePath.mock.calls[1]).toStrictEqual([outputDir])
        expect(fsUtils.findSpecFiles.mock.calls.length).toBe(1)
        expect(fsUtils.findSpecFiles.mock.lastCall).toStrictEqual([pathToDir])
        expect(fsUtils.readFile.mock.calls.length).toBe(4)
        expect(yamlLoader.load.mock.calls.length).toBe(2)
        expect(specUtils.validateSpecArray.mock.calls.length).toBe(1)
        expect(astFactory.fromCode.mock.calls.length).toBe(1)
        expect(
            astFactory.fromSpec.mock.calls.length
        ).toBe(1)
    })
})
