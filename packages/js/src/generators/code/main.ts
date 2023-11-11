import ts, { type Printer, type SourceFile } from 'typescript'
import type { TechSpec, TechSpecContainer } from '../../spec/types'
import { FormsCodeGenerator } from '../code/forms'
import { DesignSystemCodeGenerator } from './designSystem'
import { TypesCodeGenerator } from './types'

export class CodeFactory {
    private readonly printer: Printer
    private readonly sourceFile: SourceFile
    private readonly forms: FormsCodeGenerator
    private readonly designSystems: DesignSystemCodeGenerator
    private readonly types: TypesCodeGenerator
    constructor () {
        this.printer = ts.createPrinter({ })
        this.sourceFile = ts.createSourceFile(
            '',
            '',
            ts.ScriptTarget.Latest,
            false,
            ts.ScriptKind.TS
        )
        this.types = new TypesCodeGenerator()
        this.forms = new FormsCodeGenerator(this.types)
        this.designSystems = new DesignSystemCodeGenerator()
    }

    generate (
        spec: TechSpecContainer
    ): Partial<Record<TechSpec['type'], string>> {
        return {
            form: this.render(this.forms.genCode(spec.forms)),
            DesignSystem: this.render(
                this.designSystems.genCode(spec.designSystems)
            ),
            feature: undefined,
            type: this.render(this.types.genCode(spec.types))
        }
    }

    protected render (nodes: ts.Node[]): string | undefined {
        if (nodes.length === 0) return undefined
        const string = this.printer.printList(
            ts.ListFormat.MultiLine,
            ts.factory.createNodeArray(nodes),
            this.sourceFile
        )
        return JSON.parse(
            JSON.stringify(
                string.replace(/\\u/g, '%u')
            ).replace(/%u/g, '\\u')
        )
    }
}
