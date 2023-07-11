# Tech-Spec

## Installation
```bash
    npm install -g tech-spec
```

## Usage example

tech-spec/check.tech-spec.yaml
```yaml
type: theme
metadata:
  name: light
spec:
  colors:
    check: rgba(255, 255, 255, 255)
```

Command: ```bash
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
