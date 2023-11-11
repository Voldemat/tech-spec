import type ts from 'typescript'
import type { DesignSystem } from '../../spec/types'
import { getEntries } from '../../utils'
import { BaseCodeGenerator } from './base'

export class DesignSystemCodeGenerator extends BaseCodeGenerator<DesignSystem> {
    genCode (systems: DesignSystem[]): ts.Node[] {
        return systems.map(sys => {
            return this.buildVariable(
                sys.metadata.name,
                this.buildAsConst(
                    this.buildObject([
                        this.buildProperty(
                            'colors',
                            this.buildColors(sys.spec.colors)
                        )
                    ]
                    )
                ),
                true
            )
        })
    }

    private buildColors (
        colors: Record<string, Record<string, string>>
    ): ts.ObjectLiteralExpression {
        return this.buildObject(
            getEntries(colors).map(([key, value]) => {
                return this.buildProperty(
                    key,
                    this.buildObject(
                        getEntries(value).map(([theme, color]) => {
                            return this.buildProperty(
                                theme, this.buildString(color)
                            )
                        })
                    )
                )
            })
        )
    }
}
