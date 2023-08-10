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
    fieldRef: login
    errorMessage: null

  password:
    fieldRef: password
    required: true
    errorMessage: 'Invalid'
`
export const formExpectedCode = `export const RegistrationForm = {
  login: {
    required: true,
    fieldRef: "login",
    errorMessage: null,
    helperMessage: null,
    field: {"type":"string","regex":` +
    rmTrailingSlashes('"^[\\w_]{4,100}$"') + `}
  },
  password: {
    fieldRef: "password",
    required: true,
    errorMessage: "Invalid",
    helperMessage: null,
    field: {"type":"string","regex":` +
    rmTrailingSlashes('"^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9]){5;150}$"') +
    `}
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
type: field
metadata:
  name: login
spec:
  type: string
  regex: ` + rmTrailingSlashes('"^[\\w_]{4,100}$"') + `
`
export const passwordFieldContent = `
type: field
metadata:
  name: password
spec:
  type: string
  regex: ` + rmTrailingSlashes('^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9]){5;150}$') + `
`
