---
name: project-starter-core
description: Shared setup and rules for every new w7 web project (better-result, core <name>Fn functions behind thin wrappers, TanStack Query/Form/Table, shadcn + reui, frontend-design skill). Used by project-starter-tanstack-start and project-starter-convex; run one of those instead of this directly.
---

# Project starter: core

This is the shared base for new projects. It is normally run as the first half of
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
<pm> add better-result zod @tanstack/react-query @tanstack/react-form @tanstack/react-table
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

## 5. Write the project rules

Copy [templates/AGENTS.md](templates/AGENTS.md) to the project root as `AGENTS.md`. If an
`AGENTS.md` already exists, merge the sections in instead of overwriting. If the project uses
Claude Code and has no `CLAUDE.md`, create one containing only `@AGENTS.md`.
The variant skill appends its backend section to the same file.

## 6. Verify and report

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
  `instanceof` checks. See https://better-result.dev/errors/matching-errors.
- **Thin wrappers over core `<name>Fn` functions.** All business logic lives in the core folder.
  Every core function is named `<name>Fn` (e.g. `createInvoiceFn`). Server functions, queries,
  mutations and actions are thin wrappers: validate input, resolve auth/context, call the `Fn`,
  turn its `Result` into the transport's success/error. No business logic in the wrapper.
- **TanStack Query** for every data fetch and mutation in the frontend. No `useEffect` fetching.
- **TanStack Form** for every form, rendered with the shadcn `Field` components.
- **TanStack Table** for every table; prefer the reui data grid on top of it.
- **shadcn + reui.** Use shadcn components, and use reui components whenever reui has one.
- **No subtitles.** Never add a subtitle, description or tagline under a heading unless the user
  asks for one.
- **frontend-design skill.** Load and follow the `frontend-design` skill whenever designing or
  restyling frontend UI.
