# Tech-Spec
![CI](https://github.com/Voldemat/tech-spec/actions/workflows/publish.yml/badge.svg)

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
