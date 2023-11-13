import type ts from 'typescript'
import { type Feature } from '../../spec/types'
import { BaseCodeGenerator } from './base'
import type { FeatureFieldSpec, FeatureSpec } from '../../spec/types/feature'

export class FeaturesCodeGenerator extends BaseCodeGenerator<Feature> {
    genCode (items: Feature[]): ts.Node[] {
        return items
            .map(item => this.genFeatureVariable(item))
            .filter((item): item is ts.VariableStatement => item !== null)
    }

    private genFeatureVariable (
        item: Feature
    ): ts.VariableStatement | null {
        return this.buildVariable(
            this.featureNameToCodeName(item.metadata.name),
            this.buildFeatureValue(item.spec),
            true
        )
    }

    private featureNameToCodeName (name: string): string {
        return name + 'Feature'
    }

    private buildFeatureValue (spec: FeatureSpec): ts.AsExpression {
        return this.buildAsConst(
            this.buildObject(
                this.buildStringProperties(
                    Object.entries(spec)
                        .map(([pName, pValue]): [
                            string, ts.ObjectLiteralExpression
                        ] => ([pName, this.buildFeatureFieldValue(pValue)]))
                ),
                true
            )
        )
    }

    private buildFeatureFieldValue (
        spec: FeatureFieldSpec
    ): ts.ObjectLiteralExpression {
        return this.buildObject(
            this.buildStringProperties([
                ['type', this.buildString(spec.type)],
                ['value', this.buildStringOrNumber(spec.value)]
            ]), true
        )
    }
}
