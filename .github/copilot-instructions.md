# Copilot Instructions

## Stack

React 19, TypeScript (strict), Vite 8, ESLint

## Commands

```bash
npm run dev        # Start dev server at http://localhost:5173
npm run build      # Type-check + production build (tsc -b && vite build)
npm run lint       # Run ESLint
npm run preview    # Preview production build locally
```

## TypeScript config

- Strict mode, target ES2023
- `noUnusedLocals`, `noUnusedParameters` are **on** — unused variables are errors
- `verbatimModuleSyntax` is enabled — use `import type` for type-only imports
- `erasableSyntaxOnly` is on — avoid TypeScript-only runtime syntax (e.g. `enum`, `namespace`)
- JSX transform: `react-jsx` (no need to import React in every file)

## Language

All code, comments, variable names, and commit messages must be written in **English**.

## Conventions

- Use `.tsx` for files containing JSX, `.ts` for everything else
- Organise source into subdirectories as the project grows (e.g. `src/components/`, `src/pages/`)
