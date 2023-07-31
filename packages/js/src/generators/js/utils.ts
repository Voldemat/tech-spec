export function nestedOmit (
    obj: Record<string, any>, omitKeys: string[]
): Record<string, any> {
    const newObj: Record<string, any> = {}
    Object.entries(obj).forEach(([key, value]: [string, any]) => {
        if (omitKeys.includes(key)) {
            return
        }
        if (value instanceof Array) {
            newObj[key] = value.map((v) => nestedOmit(v, omitKeys))
        } else if (value instanceof Object) {
            newObj[key] = nestedOmit(value, omitKeys)
        } else {
            newObj[key] = value
        }
    })
    return newObj
}
