export class BaseAstFactory {
    buildProgram (body: Array<Record<string, any>>): Record<string, any> {
        return {
            type: 'Program',
            body,
            sourceType: 'module'
        }
    }

    buildExportDeclaration (
        declaration: Record<string, any>
    ): Record<string, any> {
        return {
            type: 'ExportNamedDeclaration',
            declaration
        }
    }

    buildVariable (
        kind: 'const' | 'let' | 'var',
        name: string,
        value: Record<string, any>
    ): Record<string, any> {
        return {
            type: 'VariableDeclaration',
            kind,
            declarations: [
                {
                    type: 'VariableDeclarator',
                    id: {
                        type: 'Identifier',
                        name
                    },
                    init: value
                }
            ]
        }
    }

    buildObjectExpression (
        properties: Array<Record<string, any>>
    ): Record<string, any> {
        return {
            type: 'ObjectExpression',
            properties
        }
    }

    buildProperty (
        key: string,
        value: Record<string, any>
    ): Record<string, any> {
        return {
            type: 'Property',
            method: false,
            shorthand: false,
            computed: false,
            kind: 'init',
            key: {
                type: 'Identifier',
                name: key
            },
            value
        }
    }
}
