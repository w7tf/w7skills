# Project rules

## Error handling: better-result

- Core functions return `Result<T, E>` (or `Promise<Result<T, E>>`) from `better-result` instead of throwing.
- Errors are `TaggedError` classes. Shared ones live in `core/errors.ts`; domain errors live next to the core module that returns them.
- Wrap throwing calls (SDKs, `fetch`, `JSON.parse`) with `Result.try` / `Result.tryPromise({ try, catch })`.
- Compose results with `Result.gen` or `andThen` instead of nested `if` checks.
- Branch on errors only with exhaustive matching: `error.match({ ... })` or `matchError(error, { ... })`. Use `matchErrorPartial` only when deliberately handling a subset. No `_tag === ...` chains, no `instanceof`.
- Docs: https://better-result.dev/errors/matching-errors

## Thin wrappers over core functions

- All business logic lives in the core folder.
- Every core function is named `<name>Fn` (e.g. `createInvoiceFn`). The `Fn` suffix is mandatory so a core function is never confused with the wrapper of the same name.
- Server functions / queries / mutations / actions are thin wrappers: validate input, resolve auth and context, call the `Fn`, convert its `Result` to the transport's success or error. Nothing else.
- Input schemas are Zod, named `z<Name>Args`, with the type exported as `<Name>Args`. They live in the core module next to the `Fn` that uses them.

## Frontend

- Data fetching and mutations: TanStack Query only. No `useEffect` fetching.
- Forms: TanStack Form only, rendered with shadcn `Field` components.
- Tables: TanStack Table only; prefer the reui data grid.
- Components: shadcn, and reui (https://reui.io/components) whenever reui has a component for the job. Add them with `shadcn add @reui/<name>`.
- Never add a subtitle, description or tagline under a heading unless explicitly asked.
- When designing or restyling UI, load and follow the `frontend-design` skill.
