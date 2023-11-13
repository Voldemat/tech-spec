/* eslint-disable */
import { rmTrailingSlashes } from './conftest'

export const designSystemContent = `
type: DesignSystem
metadata:
    name: main
spec:
    colors:
        check:
            light: rgba(255, 255, 255, 255)
`
export const formYamlContent = `
type: form
metadata:
  name: 'Registration'
spec:
  login:
    required: true
    type: login
    errorMessage: null
    maxLength: 40
  anotherLogin:
    required: true
    type: login
    errorMessage: null
    maxLength: 20
  password:
    type: password
    required: true
    errorMessage: 'Invalid'
    placeholder: 'password'
  price:
    type: price
    required: true
    errorMessage: null
    placeholder: null
  date:
    type: justDate
    required: true
    errorMessage: null
  eventDate:
    type: futureDate
    required: true
    errorMessage: null
    placeholder: null
  eventTime:
    type: timeFuture
    required: true
    errorMessage: null
    placeholder: null
  eventDateTime:
    type: datetimeFuture
    required: true
    errorMessage: null
  avatar:
    type: avatar
    required: true
    errorMessage: null
  document:
    type: AnyDocument
    required: true
    errorMessage: null
  city:
    type: citiesEnum
    required: true
    errorMessage: null
  loginAuth:
    type: loginAuthUnion
    required: true
    errorMessage: null
`
export const formExpectedCode = 
`import { loginType, passwordType, \
priceType, justDateType, futureDateType, \
timeFutureType, datetimeFutureType, avatarType, \
AnyDocumentType, citiesEnumType, loginAuthUnionType \
} from "./types";
export const RegistrationForm = {
    login: {
        type: "login",
        required: true,
        errorMessage: null,
        placeholder: null,
        helperMessage: null,
        maxLength: 40,
        typeSpec: loginType
    },
    anotherLogin: {
        type: "login",
        required: true,
        errorMessage: null,
        placeholder: null,
        helperMessage: null,
        maxLength: 20,
        typeSpec: loginType
    },
    password: {
        type: "password",
        required: true,
        errorMessage: "Invalid",
        placeholder: "password",
        helperMessage: null,
        maxLength: null,
        typeSpec: passwordType
    },
    price: {
        type: "price",
        required: true,
        errorMessage: null,
        placeholder: null,
        helperMessage: null,
        maxLength: null,
        typeSpec: priceType
    },
    date: {
        type: "justDate",
        required: true,
        errorMessage: null,
        placeholder: null,
        helperMessage: null,
        maxLength: null,
        typeSpec: justDateType
    },
    eventDate: {
        type: "futureDate",
        required: true,
        errorMessage: null,
        placeholder: null,
        helperMessage: null,
        maxLength: null,
        typeSpec: futureDateType
    },
    eventTime: {
        type: "timeFuture",
        required: true,
        errorMessage: null,
        placeholder: null,
        helperMessage: null,
        maxLength: null,
        typeSpec: timeFutureType
    },
    eventDateTime: {
        type: "datetimeFuture",
        required: true,
        errorMessage: null,
        placeholder: null,
        helperMessage: null,
        maxLength: null,
        typeSpec: datetimeFutureType
    },
    avatar: {
        type: "avatar",
        required: true,
        errorMessage: null,
        placeholder: null,
        helperMessage: null,
        maxLength: null,
        typeSpec: avatarType
    },
    document: {
        type: "AnyDocument",
        required: true,
        errorMessage: null,
        placeholder: null,
        helperMessage: null,
        maxLength: null,
        typeSpec: AnyDocumentType
    },
    city: {
        type: "citiesEnum",
        required: true,
        errorMessage: null,
        placeholder: null,
        helperMessage: null,
        maxLength: null,
        typeSpec: citiesEnumType
    },
    loginAuth: {
        type: "loginAuthUnion",
        required: true,
        errorMessage: null,
        placeholder: null,
        helperMessage: null,
        maxLength: null,
        typeSpec: loginAuthUnionType
    }
} as const;
`
export const designSystemExpectedCode = `export const main = {
    colors: {
        check: {
            light: "rgba(255, 255, 255, 255)"
        }
    }
} as const;
`
export const typesExpectedCode = `\
export const timeFutureType = {
    type: "time",
    allowOnly: "future"
} as const;
export const priceType = {
    type: "float",
    min: 0.1,
    max: null
} as const;
export const passwordType = {
    type: "int",
    min: 1,
    max: 100
} as const;
export const loginType = {
    type: "string",
    regex: /^[\\w_]{4,100}$/
} as const;
export const justDateType = {
    type: "date",
    allowOnly: null
} as const;
export const futureDateType = {
    type: "date",
    allowOnly: "future"
} as const;
export const datetimeFutureType = {
    type: "datetime",
    allowOnly: "future"
} as const;
export const cityType = {
    type: "string",
    regex: /.{1,30}/
} as const;
export const avatarType = {
    type: "image",
    minSize: null,
    maxSize: {
        value: 10,
        unit: "mb"
    },
    allowedTypes: ["jpeg", "png", "webp", "svg"],
    maxWidth: null,
    minWidth: null,
    maxHeight: null,
    minHeight: null,
    aspectRatio: {
        width: 1,
        height: 1
    }
} as const;
export const AnyDocumentType = {
    type: "file",
    minSize: null,
    maxSize: {
        value: 500,
        unit: "kb"
    },
    allowedMimeTypes: null
} as const;
export const citiesEnumType = {
    type: "enum",
    itemType: "city",
    itemTypeSpec: cityType,
    items: ["Moscow", "Tashkent"]
} as const;
export const loginAuthUnionType = {
    type: "union",
    types: ["login", "password"],
    typeSpecs: [loginType, passwordType]
} as const;
`
export const loginFieldContent = `
type: type
metadata:
  name: login
spec:
  type: string
  regex: ` + rmTrailingSlashes('"^[\\w_]{4,100}$"') + `
`
export const passwordFieldContent = `
---
type: type
metadata:
  name: password
spec:
  type: int
  max: 100
  min: 1
...
---
type: type
metadata:
  name: price
spec:
  type: float
  min: 0.1
...
---
type: type
metadata:
  name: futureDate
spec:
  type: date
  allowOnly: future
...
---
type: type
metadata:
  name: timeFuture
spec:
  type: time
  allowOnly: future
...
---
type: type
metadata:
  name: datetimeFuture
spec:
  type: datetime
  allowOnly: future
...
---
type: type
metadata:
  name: avatar
spec:
  type: image
  allowedTypes:
    - jpeg
    - png
    - webp
    - svg
  maxSize:
    unit: mb
    value: 10
  aspectRatio:
    width: 1
    height: 1
...
---
type: type
metadata:
  name: AnyDocument
spec:
  type: file
  maxSize:
    unit: kb
    value: 500
...
---
type: type
metadata:
  name: city
spec:
  type: string
  regex: '.{1,30}'
...
---
type: type
metadata:
  name: citiesEnum
spec:
  type: enum
  itemType: city
  items:
    - Moscow
    - Tashkent
...
---
type: type
metadata:
  name: loginAuthUnion
spec:
  type: union
  types:
    - login
    - password
...
---
type: type
metadata:
  name: justDate
spec:
  type: date
`
