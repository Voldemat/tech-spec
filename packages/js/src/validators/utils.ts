import type {
    FileSize,
    ImageTypeSpec
} from '../spec/types/type'
import type { IValidatorResult, ScalarValidInput } from './types'

export function createUnhandledError (error: never): Error {
    return new Error(error)
}
export function createValidationError (
    error: string | null
): IValidatorResult {
    return {
        isValid: false,
        errorMessage: error
    }
}
function isNumberValueValid (
    n: number | typeof NaN,
    min: number | null,
    max: number | null
): boolean {
    return (
        !Number.isNaN(n) &&
        (max === null || n < max) &&
        (min === null || n > min)
    )
}

const timeRegExp = /^([0-1]?[0-9]|2[0-4]):([0-5][0-9])$/
function isTimeValid (
    time: string, allowOnly: 'future' | 'past' | null
): boolean {
    const isValid = timeRegExp.test(time)
    if (!isValid) return false
    const [hours, minutes] = time.split(':').map(v => parseInt(v, 10))
    const date = new Date()
    const currentDate = new Date()
    date.setHours(hours, minutes)
    return isSpecDateValid(date, currentDate, allowOnly)
}
function isSpecDateValid (
    date: Date,
    currentDate: Date,
    allowOnly: 'future' | 'past' | null
): boolean {
    return (
        allowOnly === null ||
        (allowOnly === 'future' || currentDate > date) ||
        (allowOnly === 'past' || currentDate < date)
    )
}
function isDateValid (
    date: string, allowOnly: 'future' | 'past' | null
): boolean {
    const d = new Date(date)
    if (!(d instanceof Date) || isNaN(d as any)) return false
    if (allowOnly === null) return true
    const currentDate = new Date()
    currentDate.setHours(0, 0, 0, 0)
    return isSpecDateValid(d, currentDate, allowOnly)
}
function isDateTimeValid (
    date: string, allowOnly: 'future' | 'past' | null
): boolean {
    const d = new Date(date)
    if (!(d instanceof Date) || isNaN(d as any)) return false
    if (allowOnly === null) return true
    const currentDate = new Date()
    return isSpecDateValid(d, currentDate, allowOnly)
}
function calcSize (size: FileSize): number {
    switch (size.unit) {
    case 'b':
        return size.value
    case 'kb':
        return size.value * 1000
    case 'mb':
        return size.value * 1_000_000
    case 'gb':
        return size.value * 1_000_000_000
    default: {
        const error: never = size.unit
        throw new Error('Unhandled file size unit: ' + String(error))
    }
    }
}
function isFileValid (
    file: File,
    minSize: FileSize | null,
    maxSize: FileSize | null,
    allowedTypes: string[] | null
): boolean {
    return (
        (maxSize === null || file.size < calcSize(maxSize)) &&
        (minSize === null || file.size > calcSize(minSize)) &&
        (
            allowedTypes === null ||
            allowedTypes.includes(file.type)
        )
    )
}
/* eslint-disable max-lines-per-function */
export async function isImageValid (
    file: File,
    spec: ImageTypeSpec
): Promise<boolean> {
    let allowedTypes: string[] | null = null
    if (spec.allowedTypes !== null) {
        allowedTypes = spec.allowedTypes.map(t => 'image/' + t)
    }
    if (
        !isFileValid(
            file, spec.minSize, spec.maxSize, allowedTypes
        )
    ) return false
    const image = new Image()
    const reader = new FileReader()
    reader.readAsDataURL(file)
    await new Promise<void>(resolve => {
        reader.onload = () => {
            image.src = reader.result as string
            resolve()
        }
    })
    await new Promise<void>(resolve => {
        image.onload = () => {
            resolve()
        }
    })
    const aRatio = spec.aspectRatio
    return (
        (spec.minWidth === null || spec.minWidth < image.width) &&
        (spec.minHeight === null || spec.minHeight < image.height) &&
        (spec.maxHeight === null || spec.maxHeight < image.height) &&
        (spec.maxWidth === null || spec.maxWidth < image.height) &&
        (
            aRatio === null ||
            aRatio.width / aRatio.height === image.width / image.height
        )
    )
}

// eslint-disable-next-line @typescript-eslint/promise-function-async
export function isScalarValueValid (
    v: string | File,
    typeSpec: ScalarValidInput
): boolean {
    switch (typeSpec.type) {
    case 'string': {
        return (!(v instanceof File) && typeSpec.regex.test(v))
    }
    case 'int': {
        if (v instanceof File) return false
        return isNumberValueValid(parseInt(v, 10), typeSpec.min, typeSpec.max)
    }
    case 'float': {
        if (v instanceof File) return false
        return isNumberValueValid(parseFloat(v), typeSpec.min, typeSpec.max)
    }
    case 'time': {
        if (v instanceof File) return false
        return isTimeValid(v, typeSpec.allowOnly)
    }
    case 'date': {
        if (v instanceof File) return false
        return isDateValid(v, typeSpec.allowOnly)
    }
    case 'datetime': {
        if (v instanceof File) return false
        return isDateTimeValid(v, typeSpec.allowOnly)
    }
    case 'file': {
        if (!(v instanceof File)) return false
        return isFileValid(
            v,
            typeSpec.minSize,
            typeSpec.maxSize,
            typeSpec.allowedMimeTypes
        )
    }
    case 'enum': {
        if (v instanceof File) return false
        if (!isScalarValueValid(v, typeSpec.itemTypeSpec)) return false
        return typeSpec.items.includes(v)
    }
    case 'union': {
        return Object.values(typeSpec.typeSpecs)
            .map(tSpec => isScalarValueValid(v, tSpec))
            .includes(true)
    }
    default: {
        throw createUnhandledError(typeSpec)
    }
    }
}
/* eslint-enable max-lines-per-function */
