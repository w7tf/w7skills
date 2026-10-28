---
name: project-starter-core
description: Shared setup and rules for every new w7 web project, which is always TanStack Start, with or without Convex (better-result, t3-env, core <name>Fn functions behind thin wrappers, TanStack Query/Form/Table, shadcn + reui, frontend-design skill). Used by project-starter-tanstack-start and project-starter-convex; run one of those instead of this directly.
---

# Project starter: core

This is the shared base for new projects. Every w7 project is TanStack Start, either with Convex
(`project-starter-convex`) or on its own (`project-starter-tanstack-start`). It is normally run as the first half of
`project-starter-tanstack-start` or `project-starter-convex`. Those skills add the backend-specific
part (where the thin wrappers live and what they wrap).

Run every step below against the target project. Do not just describe them. When a step is already
done (dependency present, file exists), skip it and say so in the summary.

## 0. Detect the project

1. Find the app root: the folder with `package.json` and the TanStack Start / Vite config. In a
   monorepo this is usually `apps/web`.
2. Pick the package manager from the lockfile: `pnpm-lock.yaml` → pnpm, `bun.lock(b)` → bun,
   `yarn.lock` → yarn, `package-lock.json` → npm. No lockfile → pnpm.
   Below, `<pm> add` / `<pm>x` mean the matching command (`pnpm add` / `pnpm dlx`, `npm install` / `npx`, ...).
3. Note the source folder (`src/` by default) and the path alias used for it (`@/` by default).

## 1. Install dependencies

```bash
<pm> add better-result zod @t3-oss/env-core @tanstack/react-query @tanstack/react-form @tanstack/react-table
<pm> add -D @tanstack/react-query-devtools
```

Wire TanStack Query into the router if the template did not already (a single `QueryClient`
created per request in the router factory, passed through router context, wrapped in
`QueryClientProvider`; with TanStack Start use `@tanstack/react-router-ssr-query`'s
`setupRouterSsrQueryIntegration`).

## 2. shadcn + reui

1. If there is no `components.json`, run `<pm>x shadcn@latest init` and accept the TanStack Start /
   Vite defaults.
2. Add the reui registry to `components.json` (merge, do not replace existing registries):

   ```json
   "registries": {
     "@reui": "https://reui.io/r/{name}.json"
   }
   ```

3. Install the base components every project needs:

   ```bash
   <pm>x shadcn@latest add button input label field card dialog sheet dropdown-menu select \
     checkbox textarea badge separator skeleton sonner tooltip table
   ```

4. Browse https://reui.io/components and add reui components with
   `<pm>x shadcn@latest add @reui/<name>` whenever reui has one for the job (data grid, filters,
   date selectors, file upload, stepper, ...). Prefer reui over hand-built or plain shadcn
   equivalents.

## 3. Install the frontend-design skill

```bash
npx skills add anthropics/skills --skill frontend-design -y
```

If the `skills` CLI is unavailable, copy `skills/frontend-design` from
https://github.com/anthropics/skills into the project's `.agents/skills/` (or `.claude/skills/`).

## 4. Scaffold the core folder and shared helpers

Create the core folder for business logic (the variant skill says where it lives) and copy
[templates/errors.ts](templates/errors.ts) next to it as `errors.ts`. It defines the shared
tagged errors that core functions return.

## 5. Typed environment variables (t3-env)

Copy [templates/env.ts](templates/env.ts) to `src/env.ts`. Move every variable the project
already uses (from `.env*` files and existing `process.env` / `import.meta.env` reads) into its
`server` or `client` schema, and replace those reads with `env.X`. Client variables must start with
`VITE_`. Make sure `.env*.local` is in `.gitignore`, and keep a committed `.env.example` listing every
variable with an empty or placeholder value. Docs: https://env.t3.gg/docs/core

## 6. Write the project rules

Copy [templates/AGENTS.md](templates/AGENTS.md) to the project root as `AGENTS.md`. If an
`AGENTS.md` already exists, merge the sections in instead of overwriting. If the project uses
Claude Code and has no `CLAUDE.md`, create one containing only `@AGENTS.md`.
The variant skill appends its backend section to the same file.

## 7. Verify and report

Run the project's typecheck (`<pm> run typecheck` or `<pm>x tsc --noEmit`). Fix what this setup
broke. Then give the user a short summary: what was installed, what was skipped because it was
already there, and anything they must do by hand.

## Rules (also written into AGENTS.md)

These apply to all code written in the project afterwards.

- **better-result everywhere.** Core functions return `Result<T, E>` (or
  `Promise<Result<T, E>>`) instead of throwing. Errors are `TaggedError` classes. Wrap throwing
  third-party calls with `Result.try` / `Result.tryPromise({ try, catch })`. Compose with
  `Result.gen` or `andThen`.
- **Handle errors by matching.** Branch on errors with exhaustive `error.match({...})` /
  `matchError(error, {...})` so a new error variant fails the typecheck. Use `matchErrorPartial`
  only when you deliberately handle a subset. Never `if (error._tag === ...)` chains, never
  `instanceof` checks on domain errors (`instanceof` on a transport error such as `ConvexError`
  is fine). In the frontend, turn a failed call into a `ClientError` first (`toClientError` from
  core `errors.ts`), whose `_tag` is a closed union, so the match stays exhaustive. See
  https://better-result.dev/errors/matching-errors.
- **Thin wrappers over core `<name>Fn` functions.** All business logic lives in the core folder.
  Every core function is named `<name>Fn` (e.g. `createInvoiceFn`). Server functions, queries,
  mutations and actions are thin wrappers: validate input, resolve auth/context, call the `Fn`,
  turn its `Result` into the transport's success/error. No business logic in the wrapper.
- **t3-env for all environment variables.** Read variables only through the `env` object of the
  project's env module: `src/env.ts`, or the backend's own env module when the variant adds one
  (Convex: `<convex dir>/env.ts`). Every new variable is added to its schema and to
  `.env.example`. Never read `process.env` or `import.meta.env` directly.
- **TanStack Query** for every data fetch and mutation in the frontend. No `useEffect` fetching.
  On routes, prefetch in the loader with `context.queryClient.ensureQueryData(...)` and read with
  `useSuspenseQuery(...)`, so server-rendered pages arrive with their data.
- **Zod 4 imports.** Always `import * as z from "zod"`.
- **TanStack Form** for every form, rendered with the shadcn `Field` components.
- **TanStack Table** for every table; prefer the reui data grid on top of it.
- **shadcn + reui.** Use shadcn components, and use reui components whenever reui has one.
- **No subtitles.** Never add a subtitle, description or tagline under a heading unless the user
  asks for one.
- **frontend-design skill.** Load and follow the `frontend-design` skill whenever designing or
  restyling frontend UI.
