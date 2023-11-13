/* eslint-disable max-lines,max-lines-per-function */
import ts from 'typescript'
import { type Type } from '../../../spec/types'
import { BaseSpecGenerator } from './base'
import {
    type DateTimeTypeAst,
    type FileSizeAst,
    type FileTypeAst,
    type ImageTypeAst,
    type NumericTypeAst,
    type StringTypeAst,
    type TypeAst,
    imageTypeSpecPropertyNames,
    typeSpecTypes,
    type EnumTypeAst,
    type UnionTypeAst,
    type ImageAspectRatioAst
} from './types'
import type {
    DateTimeTypeSpec,
    FileSize,
    ImageAspectRatio,
    ImageTypeSpec,
    TypeSpec
} from '../../../spec/types/type'

export class TypesSpecGenerator extends BaseSpecGenerator<Type> {
    getSpec (nodes: ts.Node[]): Type[] {
        return nodes
            .map(node => this.extractNameAndValueFromVariable(node))
            .filter(
                (t): t is [string, ts.ObjectLiteralExpression] => t !== null
            )
            .map(([typeName, typeValue]) => this.genType(typeName, typeValue))
            .sort((t1, t2) => t1.metadata.name.localeCompare(t2.metadata.name))
    }

    protected codeNameToSpecName (codeName: string): string {
        return codeName.slice(0, codeName.length - 4)
    }

    private genType (
        typeName: string,
        typeValue: ts.ObjectLiteralExpression
    ): Type {
        const ast = this.genTypeAst(typeValue)
        if (!(ast instanceof Object)) {
            throw new Error(`type:${typeName}: ${ast}`)
        }
        return this.astToSpec(typeName, ast)
    }

    private astToSpec (name: string, ast: TypeAst): Type {
        const typeWithoutSpec: Omit<Type, 'spec'> = {
            type: 'type',
            metadata: { name }
        }
        switch (ast.type) {
        case 'string':
            return {
                ...typeWithoutSpec,
                spec: {
                    type: ast.type,
                    regex: this.extractRegex(ast.regex)
                }

            }
        case 'int':
        case 'float':
            return {
                ...typeWithoutSpec,
                spec: {
                    type: ast.type,
                    max: this.extractFloatOrNull(ast.max),
                    min: this.extractFloatOrNull(ast.min)
                }
            }
        case 'time':
        case 'date':
        case 'datetime':
            return {
                ...typeWithoutSpec,
                spec: {
                    type: ast.type,
                    allowOnly: this.extractStringOrNull(
                        ast.allowOnly
                    ) as DateTimeTypeSpec['allowOnly']
                }
            }
        case 'file':
            return {
                ...typeWithoutSpec,
                spec: {
                    type: ast.type,
                    minSize: this.extractFileSizeOrNull(ast.minSize),
                    maxSize: this.extractFileSizeOrNull(ast.maxSize),
                    allowedMimeTypes: this.extractStringArrayOrNull(
                        ast.allowedMimeTypes
                    )
                }
            }
        case 'image':
            return {
                ...typeWithoutSpec,
                spec: {
                    type: ast.type,
                    minSize: this.extractFileSizeOrNull(ast.minSize),
                    maxSize: this.extractFileSizeOrNull(ast.maxSize),
                    allowedTypes: this.extractStringArrayOrNull(
                        ast.allowedTypes
                    ) as ImageTypeSpec['allowedTypes'],
                    minWidth: this.extractIntOrNull(ast.minWidth),
                    maxWidth: this.extractIntOrNull(ast.maxWidth),
                    minHeight: this.extractIntOrNull(ast.minHeight),
                    maxHeight: this.extractIntOrNull(ast.maxHeight),
                    aspectRatio: this.extractAspectRatioOrNull(ast.aspectRatio)
                }
            }
        case 'enum':
            return {
                ...typeWithoutSpec,
                spec: {
                    type: ast.type,
                    items: this.extractStringArray(ast.items),
                    itemType: ast.itemType.text
                }
            }
        case 'union':
            return {
                ...typeWithoutSpec,
                spec: {
                    type: ast.type,
                    types: this.extractStringArray(ast.types)
                }
            }
        }
    }

    private extractAspectRatioOrNull (
        ast: ImageAspectRatioAst | ts.NullLiteral
    ): ImageAspectRatio | null {
        if ('kind' in ast) return null
        return {
            width: this.extractInt(ast.width),
            height: this.extractInt(ast.height)
        }
    }

    private extractFileSizeOrNull (
        ast: FileSizeAst | null
    ): FileSize | null {
        if (ast === null) return null
        return {
            unit: ast.unit.text as FileSize['unit'],
            value: this.extractInt(ast.value)
        }
    }

    private buildTypeErrorMessage (field: string): string {
        return `"${field}" property is not defined or has invalid type`
    }

    private genTypeAst (
        expression: ts.ObjectLiteralExpression
    ): TypeAst | string {
        const properties = this.filterObjectProperties(expression.properties)
        const typeString = this.extractTypeFromProperties(properties)
        if (typeString === null) {
            return this.buildTypeErrorMessage('type')
        }
        switch (typeString) {
        case 'string': return this.buildStringTypeAst(properties)
        case 'float':
        case 'int': return this.buildNumericTypeAst(typeString, properties)
        case 'date':
        case 'time':
        case 'datetime':
            return this.buildDateTimeTypeAst(typeString, properties)
        case 'file': return this.buildFileTypeAst(properties)
        case 'image': return this.buildImageTypeAst(properties)
        case 'enum': return this.buildEnumTypeAst(properties)
        case 'union': return this.buildUnionTypeAst(properties)
        }
    }

    private filterObjectProperties (
        properties: ts.NodeArray<ts.ObjectLiteralElementLike>
    ): Array<[string, ts.Expression]> {
        return properties
            .filter((el): el is ts.PropertyAssignment => (
                el.kind === ts.SyntaxKind.PropertyAssignment
            ))
            .map((el): [string, ts.Expression] | null => {
                if (el.name.kind !== ts.SyntaxKind.Identifier) return null
                return [el.name.text, el.initializer]
            })
            .filter((el): el is [string, ts.Expression] => el !== null)
    }

    private buildStringTypeAst (
        properties: Array<[string, ts.Expression]>
    ): StringTypeAst | string {
        for (const [pName, pValue] of properties) {
            if (
                pName === 'regex' &&
                pValue.kind === ts.SyntaxKind.RegularExpressionLiteral
            ) {
                return {
                    type: 'string',
                    regex: pValue as ts.RegularExpressionLiteral
                }
            }
        }
        return this.buildTypeErrorMessage('regex')
    }

    private buildNumericTypeAst (
        typeName: 'int' | 'float',
        properties: Array<[string, ts.Expression]>
    ): NumericTypeAst | string {
        let min: NumericTypeAst['min'] | null = null
        let max: NumericTypeAst['max'] | null = null
        for (const [pName, pValue] of properties) {
            if (
                pValue.kind === ts.SyntaxKind.NumericLiteral ||
                pValue.kind === ts.SyntaxKind.NullKeyword
            ) {
                if (pName === 'min') min = pValue as NumericTypeAst['min']
                if (pName === 'max') max = pValue as NumericTypeAst['max']
            }
        }
        if (min === null) return this.buildTypeErrorMessage('min')
        if (max === null) return this.buildTypeErrorMessage('max')
        return {
            type: typeName,
            min,
            max
        }
    }

    private buildDateTimeTypeAst (
        typeName: DateTimeTypeAst['type'],
        properties: Array<[string, ts.Expression]>
    ): DateTimeTypeAst | string {
        for (const [pName, pValue] of properties) {
            if (
                pName === 'allowOnly' &&
                (
                    pValue.kind === ts.SyntaxKind.StringLiteral ||
                    pValue.kind === ts.SyntaxKind.NullKeyword
                )
            ) {
                return {
                    type: typeName,
                    allowOnly: (pValue as DateTimeTypeAst['allowOnly'])
                }
            }
        }
        return this.buildTypeErrorMessage('allowOnly')
    }

    private buildFileTypeAst (
        properties: Array<[string, ts.Expression]>
    ): FileTypeAst | string {
        const ast = this.buildPartialFileTypeAst(properties)
        if (typeof ast === 'string') return ast
        for (const field of ['minSize', 'maxSize', 'allowedMimeTypes']) {
            if (
                ast[field as keyof FileTypeAst] === undefined
            ) return this.buildTypeErrorMessage(field)
        }
        return ast as FileTypeAst
    }

    private buildPartialFileTypeAst (
        properties: Array<[string, ts.Expression]>
    ): Partial<FileTypeAst> | string {
        const ast: Partial<FileTypeAst> = { type: 'file' }
        for (const [pName, pValue] of properties) {
            switch (pName) {
            case 'minSize':
            case 'maxSize': {
                const error = this.setFileSizeAst(ast, pName, pValue)
                if (error !== null) return error
                break
            }
            case 'allowedMimeTypes':
                if (
                    ts.isArrayLiteralExpression(pValue) ||
                    pValue.kind === ts.SyntaxKind.NullKeyword
                ) ast.allowedMimeTypes = pValue as ts.ArrayLiteralExpression
                break
            }
        }
        return ast
    }

    private setFileSizeAst (
        ast: Partial<FileTypeAst> | Partial<ImageTypeAst>,
        pName: 'minSize' | 'maxSize',
        pValue: ts.Expression
    ): string | null {
        if (ts.isObjectLiteralExpression(pValue)) {
            const size = this.buildFileSizeAst(pValue)
            if (typeof size === 'string') {
                return this.buildTypeErrorMessage(`${pName}.${size}`)
            }
            ast[pName] = size
        } else if (pValue.kind === ts.SyntaxKind.NullKeyword) {
            ast[pName] = null
        }
        return null
    }

    private buildFileSizeAst (
        obj: ts.ObjectLiteralExpression
    ): FileSizeAst | 'unit' | 'value' {
        let unit: ts.StringLiteral | null = null
        let value: ts.NumericLiteral | null = null
        const properties = this.filterObjectProperties(obj.properties)
        for (const [pName, pValue] of properties) {
            switch (pName) {
            case 'unit':
                if (pValue.kind === ts.SyntaxKind.StringLiteral) {
                    unit = pValue as ts.StringLiteral
                }
                break
            case 'value':
                if (pValue.kind === ts.SyntaxKind.NumericLiteral) {
                    value = pValue as ts.NumericLiteral
                }
                break
            }
        }
        if (unit === null) return 'unit'
        if (value === null) return 'value'
        return { unit, value }
    }

    private buildImageTypeAst (
        properties: Array<[string, ts.Expression]>
    ): ImageTypeAst | string {
        const ast = this.buildPartialImageTypeAst(properties)
        if (typeof ast === 'string') return ast
        for (const pName of imageTypeSpecPropertyNames) {
            if (ast[pName] === undefined) {
                return this.buildTypeErrorMessage(pName)
            }
        }
        return ast as ImageTypeAst
    }

    private buildPartialImageTypeAst (
        properties: Array<[string, ts.Expression]>
    ): Partial<ImageTypeAst> | string {
        const ast: Partial<ImageTypeAst> = { type: 'image' }
        for (const [pName, pValue] of properties) {
            const error = this.setImageTypeAstProperty(
                ast,
                pName,
                pValue
            )
            if (error !== null) return error
        }
        return ast
    }

    private setImageTypeAstProperty (
        ast: Partial<ImageTypeAst>,
        pName: string,
        pValue: ts.Expression
    ): string | null {
        switch (pName) {
        case 'minSize':
        case 'maxSize': return this.setFileSizeAst(ast, pName, pValue)
        case 'minWidth':
        case 'maxWidth':
        case 'minHeight':
        case 'maxHeight': {
            if (
                ts.isNumericLiteral(pValue) ||
                pValue.kind === ts.SyntaxKind.NullKeyword
            ) {
                ast[pName] = pValue as any
            }
            return null
        }
        case 'allowedTypes':
            if (
                ts.isArrayLiteralExpression(pValue) ||
                pValue.kind === ts.SyntaxKind.NullKeyword
            ) {
                ast[pName] = pValue as any
            }
            return null
        case 'aspectRatio': {
            if (ts.isObjectLiteralExpression(pValue)) {
                return this.setAspectRatioAst(ast, pValue)
            } else if (pValue.kind === ts.SyntaxKind.NullKeyword) {
                ast[pName] = pValue as ts.NullLiteral
            }
            return null
        }
        default: return null
        }
    }

    private buildEnumTypeAst (
        properties: Array<[string, ts.Expression]>
    ): EnumTypeAst | string {
        let items: ts.ArrayLiteralExpression | null = null
        let itemType: ts.StringLiteral | null = null
        for (const [pName, pValue] of properties) {
            switch (pName) {
            case 'items':
                if (ts.isArrayLiteralExpression(pValue)) {
                    items = pValue
                }
                break
            case 'itemType':
                if (ts.isStringLiteral(pValue)) {
                    itemType = pValue
                }
            }
        }
        if (items === null) return this.buildTypeErrorMessage('items')
        if (itemType === null) return this.buildTypeErrorMessage('itemType')
        return {
            type: 'enum',
            items,
            itemType
        }
    }

    private buildUnionTypeAst (
        properties: Array<[string, ts.Expression]>
    ): UnionTypeAst | string {
        for (const [pName, pValue] of properties) {
            if (pName !== 'types') continue
            if (!ts.isArrayLiteralExpression(pValue)) continue
            return { type: 'union', types: pValue }
        }
        return this.buildTypeErrorMessage('types')
    }

    private setAspectRatioAst (
        ast: Partial<ImageTypeAst>,
        value: ts.ObjectLiteralExpression
    ): string | null {
        let width: ts.NumericLiteral | null = null
        let height: ts.NumericLiteral | null = null
        this.filterObjectProperties(value.properties)
            .forEach(([pName, pValue]) => {
                if (!ts.isNumericLiteral(pValue)) return
                switch (pName) {
                case 'width':
                    width = pValue
                    break
                case 'height':
                    height = pValue
                    break
                }
            })
        if (width === null) return 'height'
        if (height === null) return 'height'
        ast.aspectRatio = { width, height }
        return null
    }

    private extractTypeFromProperties (
        properties: Array<[string, ts.Expression]>
    ): TypeSpec['type'] | null {
        let t: TypeSpec['type'] | null = null
        properties
            .forEach(([pName, pValue]) => {
                if (
                    pName === 'type' &&
                    pValue.kind === ts.SyntaxKind.StringLiteral &&
                    typeSpecTypes.includes(
                        (pValue as ts.StringLiteral).text as any
                    )
                ) {
                    t = (pValue as ts.StringLiteral).text as TypeSpec['type']
                }
            })
        return t
    }
}
