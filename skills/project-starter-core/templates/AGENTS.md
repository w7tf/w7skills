# Project rules

## Communication: ASD-STE100

- Write all prose in ASD-STE100 Simplified Technical English: replies, summaries, plans, docs, code comments, commit messages and PR text. Load and follow the `asd-ste100` skill.
- Do not change code, identifiers, commands, paths or quoted tool output to fit the rules.

## Error handling: better-result

- Core functions return `Result<T, E>` (or `Promise<Result<T, E>>`) from `better-result` instead of throwing.
- Errors are `TaggedError` classes. Shared ones live in `core/errors.ts`; domain errors live next to the core module that returns them.
- Wrap throwing calls (SDKs, `fetch`, `JSON.parse`) with `Result.try` / `Result.tryPromise({ try, catch })`.
- Compose results with `Result.gen` or `andThen` instead of nested `if` checks.
- Branch on errors only with exhaustive matching: `error.match({ ... })` or `matchError(error, { ... })`. Use `matchErrorPartial` only when deliberately handling a subset. No `_tag === ...` chains, no `instanceof` on domain errors (`instanceof` on a transport error such as `ConvexError` is fine).
- In the frontend, convert a failed call with `toClientError` from `core/errors.ts` before matching. Its `_tag` is a closed union, so `matchError` stays exhaustive. Add a domain error's tag to `clientErrorTags` when the UI handles it.
- Docs: https://better-result.dev/errors/matching-errors

## Environment variables: t3-env

- Read environment variables only through `env` from the project's env module (`@t3-oss/env-core`): `src/env.ts`, or the backend's own env module where one exists. Never read `process.env` or `import.meta.env` directly.
- Every new variable goes into that module's schema, and into `.env.example`. Client variables start with `VITE_`.
- Docs: https://env.t3.gg/docs/core

## Thin wrappers over core functions

- All business logic lives in the core folder.
- Every core function is named `<name>Fn` (e.g. `createInvoiceFn`). The `Fn` suffix is mandatory so a core function is never confused with the wrapper of the same name.
- Server functions / queries / mutations / actions are thin wrappers: validate input, resolve auth and context, call the `Fn`, convert its `Result` to the transport's success or error. Nothing else.
- Import Zod as `import * as z from "zod"`.
- Input schemas are Zod, named `z<Name>Args`, with the type exported as `<Name>Args`. They live in the core module next to the `Fn` that uses them.

## Frontend

- Data fetching and mutations: TanStack Query only. No `useEffect` fetching.
- Route data: prefetch in the route `loader` with `context.queryClient.ensureQueryData(...)` and read it in the component with `useSuspenseQuery(...)`. Use plain `useQuery` only for data that should not block rendering.
- Forms: TanStack Form only, rendered with shadcn `Field` components.
- Tables: TanStack Table only; prefer the reui data grid.
- Components: shadcn, and reui (https://reui.io/components) whenever reui has a component for the job. Add them with `shadcn add @reui/<name>`.
- Never add a subtitle, description or tagline under a heading unless explicitly asked.
- When designing or restyling UI, load and follow the `frontend-design` skill.
