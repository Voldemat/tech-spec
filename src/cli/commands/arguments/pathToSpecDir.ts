import { Argument } from 'commander'

export const pathToSpecDirArgument = new Argument(
    '<path-to-spec-dir>',
    'Path to directory containing yaml spec files, in format *.tech-spec.yaml'
)
