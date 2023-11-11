import ts from 'typescript'
import type { Type } from '../../spec/types'
import type {
    DateTimeTypeSpec,
    DateTypeSpec,
    FileSize,
    FileTypeSpec,
    FloatTypeSpec,
    ImageTypeSpec,
    IntTypeSpec,
    StringTypeSpec,
    TimeTypeSpec,
    TypeSpec,
    ImageAspectRatio,
    EnumTypeSpec,
    UnionTypeSpec
} from '../../spec/types/type'
import { getEntries } from '../../utils'
import { BaseCodeGenerator } from './base'

type TypeSpecProperties = Record<string, ts.Expression>
export class TypesCodeGenerator extends BaseCodeGenerator<Type> {
    genCode (types: Type[]): ts.Node[] {
        return types
            .sort((t1, _) => (
                t1.spec.type === 'enum' || t1.spec.type === 'union' ? 1 : -1
            ))
            .map(t => {
                return this.buildVariable(
                    this.genTypeCodeName(t.metadata.name),
                    this.buildAsConst(
                        this.genTypeSpec(t.spec)
                    ), true
                )
            })
    }

    genTypeCodeName (typeName: string): string {
        return typeName + 'Type'
    }

    private genTypeSpec (typeSpec: TypeSpec): ts.ObjectLiteralExpression {
        return this.buildObject(
            this.buildStringProperties(
                getEntries(this.buildTypeSpecObject(typeSpec))
            )
        )
    }

    private buildTypeSpecObject (
        typeSpec: TypeSpec
    ): TypeSpecProperties {
        switch (typeSpec.type) {
        case 'string': return this.buildStringTypeSpec(typeSpec)
        case 'int': return this.buildIntTypeSpec(typeSpec)
        case 'float': return this.buildFloatTypeSpec(typeSpec)
        case 'date':
        case 'time':
        case 'datetime': return this.buildDateTimeTypeSpec(typeSpec)
        case 'file': return this.buildFileTypeSpec(typeSpec)
        case 'image': return this.buildImageTypeSpec(typeSpec)
        case 'enum': return this.buildEnumTypeSpec(typeSpec)
        case 'union': return this.buildUnionTypeSpec(typeSpec)
        default: {
            const a: never = typeSpec // eslint-disable-line
            return {}
        }
        };
    }

    private buildStringTypeSpec (typeSpec: StringTypeSpec): TypeSpecProperties {
        return {
            type: this.buildString(typeSpec.type),
            regex: ts.factory.createRegularExpressionLiteral(
                '/' + String(typeSpec.regex) + '/'
            )
        }
    }

    private buildIntTypeSpec (typeSpec: IntTypeSpec): TypeSpecProperties {
        return {
            type: this.buildString(typeSpec.type),
            min: this.buildNumberOrNull(typeSpec.min),
            max: this.buildNumberOrNull(typeSpec.max)
        }
    }

    private buildFloatTypeSpec (typeSpec: FloatTypeSpec): TypeSpecProperties {
        return {
            type: this.buildString(typeSpec.type),
            min: this.buildNumberOrNull(typeSpec.min),
            max: this.buildNumberOrNull(typeSpec.max)
        }
    }

    private buildDateTimeTypeSpec (
        typeSpec: TimeTypeSpec | DateTypeSpec | DateTimeTypeSpec
    ): TypeSpecProperties {
        return {
            type: this.buildString(typeSpec.type),
            allowOnly: this.buildStringOrNull(typeSpec.allowOnly)
        }
    }

    private buildFileTypeSpec (typeSpec: FileTypeSpec): TypeSpecProperties {
        return {
            type: this.buildString(typeSpec.type),
            minSize: this.buildFileSize(typeSpec.minSize),
            maxSize: this.buildFileSize(typeSpec.maxSize),
            allowedMimeTypes: this.buildStringArrayOrNull(
                typeSpec.allowedMimeTypes
            )
        }
    }

    private buildFileSize (
        size: FileSize | null
    ): ts.ObjectLiteralExpression | ts.NullLiteral {
        if (size === null) return ts.factory.createNull()
        return this.buildObject(
            this.buildStringProperties([
                ['value', this.buildNumber(size.value)],
                ['unit', this.buildString(size.unit)]
            ])
        )
    }

    private buildImageTypeSpec (typeSpec: ImageTypeSpec): TypeSpecProperties {
        return {
            type: this.buildString(typeSpec.type),
            minSize: this.buildFileSize(typeSpec.minSize),
            maxSize: this.buildFileSize(typeSpec.maxSize),
            allowedTypes: this.buildStringArrayOrNull(typeSpec.allowedTypes),
            maxWidth: this.buildNumberOrNull(typeSpec.maxWidth),
            minWidth: this.buildNumberOrNull(typeSpec.minWidth),
            maxHeight: this.buildNumberOrNull(typeSpec.maxHeight),
            minHeight: this.buildNumberOrNull(typeSpec.minHeight),
            aspectRation: this.buildImageAspectRatio(typeSpec.aspectRatio)
        }
    }

    private buildImageAspectRatio (
        ratio: ImageAspectRatio | null
    ): ts.ObjectLiteralExpression | ts.NullLiteral {
        return ratio === null
            ? ts.factory.createNull()
            : this.buildObject(
                this.buildStringProperties([
                    ['width', this.buildNumber(ratio.width)],
                    ['height', this.buildNumber(ratio.height)]
                ])
            )
    }

    private buildEnumTypeSpec (typeSpec: EnumTypeSpec): TypeSpecProperties {
        return {
            type: this.buildString(typeSpec.type),
            itemType: this.buildString(typeSpec.itemType),
            itemTypeSpec: ts.factory.createIdentifier(
                this.genTypeCodeName(typeSpec.itemType)
            ),
            items: this.buildStringArray(typeSpec.items)
        }
    }

    private buildUnionTypeSpec (typeSpec: UnionTypeSpec): TypeSpecProperties {
        return {
            type: this.buildString(typeSpec.type),
            types: this.buildStringArray(typeSpec.types),
            typeSpecs: this.buildArray(
                typeSpec.types.map(
                    t => ts.factory.createIdentifier(this.genTypeCodeName(t))
                )
            )
        }
    }
}
