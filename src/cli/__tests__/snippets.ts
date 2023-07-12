import { rmTrailingSlashes } from './conftest'

export const themeYamlContent = `
type: theme
metadata:
    name: light
spec:
    colors:
        check: rgba(255, 255, 255, 255)
`
export const formYamlContent = `
type: form
metadata:
  name: 'Registration'
spec:
  login:
    required: true
    regex: '^[\\w_]{4,100}$'
    errorMessage: null

  password:
    required: true
    regex: '^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9]){5;150}$'
    errorMessage: 'Invalid'

  tel:
    required: true
    regex: '^\\d{3}-\\d{3}-\\d{4}$'
    errorMessage: 'Invalid'

  name:
      required: false
      regex: ` +
      '^([а-яА-ЯёЁa-zA-Z]+ [а-яА-ЯёЁa-zA-Z]? ' +
      '[а-яА-ЯёЁa-zA-Z]? [\\-\\s]*){1;150}$' + `
      errorMessage: null
`
export const formExpectedCode = `export const RegistrationForm = {
  login: {
    required: true,
    regex: ` + rmTrailingSlashes('"^[\\w_]{4,100}$"') + `,
    errorMessage: null
  },
  password: {
    required: true,
    regex: "^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9]){5;150}$",
    errorMessage: "Invalid"
  },
  tel: {
    required: true,
    regex: ` +
    rmTrailingSlashes('"^\\d{3}-\\d{3}-\\d{4}$"') +
    `,
    errorMessage: "Invalid"
  },
  name: {
    required: false,
    regex: ` +
    rmTrailingSlashes(
        '"^([а-яА-ЯёЁa-zA-Z]+ [а-яА-ЯёЁa-zA-Z]? ' +
        '[а-яА-ЯёЁa-zA-Z]? [\\-\\s]*){1;150}$"'
    ) + `,
    errorMessage: null
  }
};
`
export const themeExpectedCode = `export const design = {
  colors: {
    check: {
      light: "rgba(255, 255, 255, 255)"
    }
  }
};
`
