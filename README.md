# Tech-Spec
[![npm version](https://badge.fury.io/js/tech-spec.svg)](https://badge.fury.io/js/tech-spec)
![CI](https://github.com/Voldemat/tech-spec/actions/workflows/publish.yaml/badge.svg)
[![codecov](https://codecov.io/gh/Voldemat/tech-spec/branch/main/graph/badge.svg?token=8YG300JEWB)](https://codecov.io/gh/Voldemat/tech-spec)
[![Maintainability](https://api.codeclimate.com/v1/badges/8a112c2fa15b633c018e/maintainability)](https://codeclimate.com/github/Voldemat/tech-spec/maintainability)
[![Test Coverage](https://api.codeclimate.com/v1/badges/8a112c2fa15b633c018e/test_coverage)](https://codeclimate.com/github/Voldemat/tech-spec/test_coverage)
[![https://nodei.co/npm/tech-spec.png?downloads=true&downloadRank=true&stars=true](https://nodei.co/npm/tech-spec.png?downloads=true&downloadRank=true&stars=true)](https://www.npmjs.com/package/tech-spec)

## Installation
```bash
npm install -g tech-spec
```

## Usage example

tech-spec/light.theme.tech-spec.yaml
```yaml
type: theme
metadata:
  name: light
spec:
  colors:
    check: rgba(255, 255, 255, 255)
```
tech-spec/registration.form.tech-spec.yaml
```yaml
type: form
metadata:
  name: Registration
spec:
  login:
    required: true
    regex: '^[\w_]{4,100}$'
    errorMessage: null

  password:
    required: true
    regex: '^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9]){5;150}$'
    errorMessage: 'Invalid'

  tel:
    required: true
    regex: '^\d{3}-\d{3}-\d{4}$'
    errorMessage: 'Invalid'

  name:
      required: false
      regex: '^([а-яА-ЯёЁa-zA-Z]+ [а-яА-ЯёЁa-zA-Z]? [а-яА-ЯёЁa-zA-Z]? [\-\s]*){1;150}$'
      errorMessage: null

```

Command:
```bash
tech-spec generate tech-spec output
```

output/theme.ts
```typescript
export const design = {
  colors: {
    check: {
      light: "rgba(255, 255, 255, 255)"
    }
  }
};
```
output/form.ts
```typescript
export const RegistrationForm = {
  login: {
    required: true,
    regex: "^[\\w_]{4,100}$",
    errorMessage: null
  },
  password: {
    required: true,
    regex: "^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9]){5;150}$",
    errorMessage: "Invalid"
  },
  tel: {
    required: true,
    regex: "^\\d{3}-\\d{3}-\\d{4}$",
    errorMessage: "Invalid"
  },
  name: {
    required: false,
    regex: "^([а-яА-ЯёЁa-zA-Z]+ [а-яА-ЯёЁa-zA-Z]? [а-яА-ЯёЁa-zA-Z]? [\\-\\s]*){1;150}$",
    errorMessage: null
  }
};
```

In your client code:
```typescript
import { buildValidators, FormValidators, ValidatorError } from 'tech-spec'
import { RegistrationForm } from '<output-dir>/form'

const validators: FormValidators<typeof RegistrationForm> = buildValidators(RegistrationForm)
const result: ValidatorError = validators.login('asd') // login has less characters than required in spec
if (!result.isValid) {
    throw new Error(result.errorMessage)
}
```


## Yaml Parsing Errors Examples

tech-spec/dark.theme.tech-spec.yaml
```yaml
type: theme
metadata:
  name: light
  asdasd
spec:
  colors:
    check: rgba(255, 255, 255, 255)
```
```bash
tech-spec validate tech-spec
```
<span style="color:red">
    🚨 YamlParsingError: tech-spec/light-theme.tech-spec.yaml

    Reason: can not read an implicit mapping pair; a colon is missed

    1 | type: theme
    2 | metadata:
    3 |   name: light
    4 |   asd
    ----------^
    5 | spec:
    6 |   colors:
</span>