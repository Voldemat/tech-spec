# Tech-Spec
[![npm version](https://badge.fury.io/js/tech-spec.svg)](https://badge.fury.io/js/tech-spec)
![CI](https://github.com/Voldemat/tech-spec/actions/workflows/packages.js.yaml/badge.svg)
[![codecov](https://codecov.io/gh/Voldemat/tech-spec/branch/main/graph/badge.svg?token=8YG300JEWB)](https://codecov.io/gh/Voldemat/tech-spec)
[![Maintainability](https://api.codeclimate.com/v1/badges/8a112c2fa15b633c018e/maintainability)](https://codeclimate.com/github/Voldemat/tech-spec/maintainability)
[![Test Coverage](https://api.codeclimate.com/v1/badges/8a112c2fa15b633c018e/test_coverage)](https://codeclimate.com/github/Voldemat/tech-spec/test_coverage)
[![https://nodei.co/npm/tech-spec.png?downloads=true&downloadRank=true&stars=true](https://nodei.co/npm/tech-spec.png?downloads=true&downloadRank=true&stars=true)](https://www.npmjs.com/package/tech-spec)

## Installation
```bash
npm install -g tech-spec
```

## Usage example

techs-spec/some-feature.tech-spec.yaml
```yaml
type: feature
metadata:
  name: somrt
spec:
  someting:
    type: date
    value: '2023-02-01'
  another:
    type: link
    value: https://google.com
  asd:
    type: string
    value: 'test string'
```
tech-spec/login.field.tech-spec.yaml
```yaml
type: field
metadata:
  name: login
spec:
    type: string
    regex: '^[\w_]{4,100}$'
```
tech-spec/password.field.tech-spec.yaml
```yaml
type: field
metadata:
  name: password
spec:
  type: string
  regex: '^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9]){5;150}$'
```
tech-spec/registration.form.tech-spec.yaml
```yaml
type: form
metadata:
  name: Registration
spec:
  login:
    required: true
    fieldRef: login
    helperMessage: null
    errorMessage: null

  password:
    required: true
    fieldRef: password
    errorMessage: 'Invalid'
    helperMessage: null
```

Command:
```bash
techspec generate tech-spec output
❇️  Code is successfully generated
```

output/form.ts
```typescript
export const RegistrationForm = {
  login: {
    required: true,
    fieldRef: "login",
    helperMessage: null,
    errorMessage: null,
    field: {
      type: "string",
      regex: new RegExp("^[\\w_]4,100}$")
    }
  },
  password: {
    required: true,
    fieldRef: "password",
    errorMessage: "Invalid",
    helperMessage: null,
    field: {
      type: "string",
      regex: new RegExp("^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9]){5;150}$")
    }
  }
};

```
output/features.ts
```typescript
export const somrtFeature = {
  someting: {
    type: "date",
    value: new Date("2023-02-01")
  },
  another: {
    type: "link",
    value: new URL("https://google.com")
  },
  asd: {
    type: "string",
    value: "adsa"
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

tech-spec/light.theme.tech-spec.yaml
```yaml
type: theme
metadata:
  name: light
  asd
spec:
  colors:
    check: rgba(255, 255, 255, 255)
```
```bash
techspec validate tech-spec
```
    🚨 YamlParsingError: tech-spec/registration.form.tech-spec.yaml

    Reason: bad indentation of a mapping entry

    4 | spec:
    5 |   login:
    6 |     asdasd
    7 |     required: true
    -----------------^
    8 |     fieldRef: login
    9 |     helperMessage: null


## Types of spec
- form
- field
- DesignSystem
- feature

### Form
type: form

Metadata fields:
- name: string

Each key in spec mapping represents name of field.

Field mapping keys:
- required: boolean
- errorMessage: string | null
- helperMessage: string | null
- fieldRef: string (must be the same as field.metadata.name)

Example:
```yaml
type: form
metadata:
  name: Registration
spec:
  login:
    required: true
    fieldRef: login
    helperMessage: null
    errorMessage: null

  password:
    required: true
    fieldRef: password
    errorMessage: 'Invalid'
    helperMessage: null
```
### Field
type: field

Metadata fields:
- name: string

Each key in spec mapping represents name of field.

Spec fields:
- type: 'string'
- regex: string (valid regex string)

Example:
```yaml
type: field
metadata:
  name: login
spec:
  type: string
  regex: '^[\w_]4,100}$'
```
### Feature
type: feature

Metadata fields:
- name: string

Each key in spec mapping represents name of field.

Different types have different configuration options.

Field types and their spec fields

- type: string

  value: string (any string)
- type: uint

  value: number (unsigned integer number)
- type: int

  value: number (signed integer number)
- type: float

  value: number (number with floating point)
- type: link

  value: string (http link)
- type: email

  value: string
- type: regex

  value: string (valid regex string)
- type: date

  value: string (date string according to [RFC3339](https://datatracker.ietf.org/doc/html/rfc3339#section-5.6))
- type: time

  value: string (time string according to [RFC3339](https://datatracker.ietf.org/doc/html/rfc3339#section-5.6))
- type: datetime

  value: string (date-time string according to [RFC3339](https://datatracker.ietf.org/doc/html/rfc3339#section-5.6))
- type: duration

  value: string (duration string according to [RFC3339](https://datatracker.ietf.org/doc/html/rfc3339#section-5.6))
- type: uuid

  value: string (valid uuid string according to [RFC4122](https://datatracker.ietf.org/doc/html/rfc4122))

Example:
```yaml
type: feature
metadata:
  name: somrt
spec:
  someting:
    type: date
    value: '2023-02-01'
  another:
    type: link
    value: https://google.com
  asd:
    type: string
    value: 'test string'
```
