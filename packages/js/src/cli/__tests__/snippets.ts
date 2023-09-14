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
export const formExpectedCode = `export const RegistrationForm = {
  login: {
    required: true,
    type: "login",
    errorMessage: null,
    maxLength: 40,
    placeholder: null,
    helperMessage: null,
    typeSpec: {
      type: "string",
      regex: new RegExp(` +
    rmTrailingSlashes('"^[\\w_]{4,100}$"') + `)
    }
  },
  password: {
    type: "password",
    required: true,
    errorMessage: "Invalid",
    placeholder: "password",
    helperMessage: null,
    maxLength: null,
    typeSpec: {
      type: "int",
      max: 100,
      min: 1
    }
  },
  price: {
    type: "price",
    required: true,
    errorMessage: null,
    placeholder: null,
    helperMessage: null,
    maxLength: null,
    typeSpec: {
      type: "float",
      max: null,
      min: 0.1
    }
  },
  date: {
    type: "justDate",
    required: true,
    errorMessage: null,
    placeholder: null,
    helperMessage: null,
    maxLength: null,
    typeSpec: {
      type: "date",
      allowOnly: null
    }
  },
  eventDate: {
    type: "futureDate",
    required: true,
    errorMessage: null,
    placeholder: null,
    helperMessage: null,
    maxLength: null,
    typeSpec: {
      type: "date",
      allowOnly: "future"
    }
  },
  eventTime: {
    type: "timeFuture",
    required: true,
    errorMessage: null,
    placeholder: null,
    helperMessage: null,
    maxLength: null,
    typeSpec: {
      type: "time",
      allowOnly: "future"
    }
  },
  eventDateTime: {
    type: "datetimeFuture",
    required: true,
    errorMessage: null,
    placeholder: null,
    helperMessage: null,
    maxLength: null,
    typeSpec: {
      type: "datetime",
      allowOnly: "future"
    }
  },
  avatar: {
    type: "avatar",
    required: true,
    errorMessage: null,
    placeholder: null,
    helperMessage: null,
    maxLength: null,
    typeSpec: {
      type: "image",
      minSize: null,
      maxSize: {
        unit: "mb",
        value: 10
      },
      minWidth: null,
      minHeight: null,
      maxWidth: null,
      maxHeight: null,
      aspectRatio: {
        width: 1,
        height: 1
      },
      allowedTypes: ["jpeg","png","webp","svg"]
    }
  },
  document: {
    type: "AnyDocument",
    required: true,
    errorMessage: null,
    placeholder: null,
    helperMessage: null,
    maxLength: null,
    typeSpec: {
      type: "file",
      minSize: null,
      maxSize: {
        unit: "kb",
        value: 500
      },
      allowedMimeTypes: null
    }
  },
  city: {
    type: "citiesEnum",
    required: true,
    errorMessage: null,
    placeholder: null,
    helperMessage: null,
    maxLength: null,
    typeSpec: {
      type: "enum",
      itemType: "city",
      items: ["Moscow","Tashkent"],
      itemTypeSpec: {
        type: "string",
        regex: new RegExp(".{1,30}")
      }
    }
  },
  loginAuth: {
    type: "loginAuthUnion",
    required: true,
    errorMessage: null,
    placeholder: null,
    helperMessage: null,
    maxLength: null,
    typeSpec: {
      type: "union",
      types: ["login","password"],
      typeSpecs: {
        login: {
          type: "string",
          regex: new RegExp(` +
            rmTrailingSlashes('"^[\\w_]{4,100}$"') + `)
        },
        password: {
          type: "int",
          max: 100,
          min: 1
        }
      }
    }
  }
};
`
export const designSystemExpectedCode = `export const main = {
  colors: {
    check: {
      light: "rgba(255, 255, 255, 255)"
    }
  }
};
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
