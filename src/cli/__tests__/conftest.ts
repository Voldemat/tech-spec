import fs from 'fs'
import util from 'util'
import execa from 'execa'

export async function runCLI (
    argv: string
): Promise<execa.ExecaReturnValue<string>> {
    return await new Promise<execa.ExecaReturnValue<string>>((resolve) => {
        const subprocess = execa.command(`npm run --silent cli ${argv}`, {
            reject: false
        })
        if (subprocess.stderr === null || subprocess.stdout === null) {
            throw new Error('Subprocess doesn`t have stderr or stdout')
        }
        Promise.resolve(subprocess).then(resolve).catch(() => {})
    })
}

export function removeDir (dir: string): void {
    fs.rm(dir, {
        recursive: true
    }, (e) => { if (e !== null) console.error(e) })
}

export function rmTrailingSlashes (str: string): string {
    return util.inspect(str).slice(1).slice(0, -1)
}
