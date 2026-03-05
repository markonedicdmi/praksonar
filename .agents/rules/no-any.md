---
description: Coding Standards and Typescript Guidelines
---

## TypeScript Types
- NEVER use `any` as a type in TypeScript code.
- If you don't know the exact type, use `unknown` and perform type narrowing, or specify a generic type properly.
- Avoiding `any` ensures that we don't accidentally silence the TypeScript compiler and maintain type safety.
