import { Argument } from 'commander'

export const genTypeArgument = new Argument(
    '<gen-type>', 'Type of generated code'
).choices(['validators'])
