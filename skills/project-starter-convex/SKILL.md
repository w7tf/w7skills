---
name: project-starter-convex
description: Set up a new TanStack Start + Convex project. Runs the project-starter-core setup, then scaffolds convex/core <name>Fn business logic behind thin Convex query/mutation/action wrappers with better-result, wires TanStack Query to Convex, and makes verified Convex components the first choice before custom code. Use when starting or bootstrapping a project that uses Convex.
---

# Project starter: Convex

Sets up a TanStack Start project with a Convex backend. Convex queries, mutations and actions are
thin wrappers over core `<name>Fn` functions. Without Convex, use
`project-starter-tanstack-start` instead.

Run every step against the target project. When a step is already done, skip it and say so.

## 1. Scaffold the app (only if the folder is empty)

```bash
pnpm create convex@latest <name>
```

Choose the TanStack Start template when asked. Use the package manager the user asked for;
otherwise pnpm.

## 2. Run the core setup

Load the `project-starter-core` skill (installed alongside this one; if it is not, read
`../project-starter-core/SKILL.md`) and run all of its steps. Use this location for its
core-folder step:

- core folder: `<convex dir>/core/` (put `errors.ts` there)

`<convex dir>` is `convex/` in a single app, or the backend package's `convex/` folder in a
monorepo (e.g. `packages/backend/convex/`).

## 3. Convex specifics

1. Install the Convex dependencies in the app (and the backend package in a monorepo):

   ```bash
   <pm> add convex @convex-dev/react-query convex-helpers zod @t3-oss/env-core
   ```

2. Wire Convex into TanStack Query if the template did not: create a `ConvexQueryClient`, set it
   as the `QueryClient`'s `queryKeyHashFn` / `queryFn` defaults, call
   `convexQueryClient.connect(queryClient)`, and wrap the app in `ConvexProvider`.
3. Copy [templates/result.ts](templates/result.ts) to `<convex dir>/lib/result.ts`.
4. Copy [templates/app-error.ts](templates/app-error.ts) to the frontend's `src/lib/app-error.ts`
   and point its `SerializedError` import at `<convex dir>/core/errors`.
5. Create `<convex dir>/functions.ts` with Zod custom functions from
   `convex-helpers/server/zod4` (`zCustomQuery`, `zCustomMutation`, `zCustomAction`). If the
   project has auth, add `authenticatedQuery` / `authenticatedMutation` / `authenticatedAction`
   that resolve the user and put it on `ctx`, and export their ctx types.
6. Copy [templates/convex-env.ts](templates/convex-env.ts) to `<convex dir>/env.ts` and add the
   deployment's variables to it (Convex functions cannot use the frontend's `src/env.ts`). Set
   the values with `npx convex env set NAME value` before the next push, because validation runs
   when Convex loads the module. Add `VITE_CONVEX_URL` to the `client` schema of `src/env.ts` and
   read the Convex URL from `env.VITE_CONVEX_URL`.
7. Install the Convex agent skills, which include `components-guide`:

   ```bash
   npx skills add get-convex/agent-skills -y
   ```

8. Append [templates/AGENTS.convex.md](templates/AGENTS.convex.md) to the project's `AGENTS.md`,
   replacing `<convex dir>` with the real path.
9. Run `npx convex dev --once` to generate `_generated/`. If it needs a login or a project
   selection, ask the user to run `npx convex dev` in their terminal once, and continue with the
   remaining steps.

## 4. Check Convex components before custom code

This applies during setup and to every feature built afterwards. Before writing custom code for a
backend capability, look for a component at https://www.convex.dev/components (or with the
`components-guide` skill).

- If a **verified** component covers the need, use it: install `@convex-dev/<component>`,
  register it with `app.use(...)` in `<convex dir>/convex.config.ts`, and call it from core
  `<name>Fn` functions.
- Only write a custom solution when no verified component fits, and tell the user which
  components you checked and why they did not fit.
- Typical needs with components: rate limiting, action retries, workpools and queues, workflows,
  aggregates and counters, migrations, crons, presence, auth, payments, email, AI agents, RAG.

## 5. Verify and report

Run the typecheck, fix anything the setup broke, and summarize for the user as described in the
core skill. Include whether `convex dev` still needs to be run by the user.

## The thin-wrapper pattern

```
convex/
  core/          business logic: <name>Fn functions, z<Name>Args schemas, domain errors
    errors.ts
    todo.ts
  lib/
    result.ts    unwrapOrThrow
  env.ts         t3-env schema for the deployment's variables
  functions.ts   Zod custom query/mutation/action builders
  todo.ts        thin wrappers only
  convex.config.ts
```

A wrapper does three things and nothing else:

1. Declares args from the core module's `z<Name>Args` schema.
2. Gets auth through its custom function builder.
3. Returns `unwrapOrThrow(await <name>Fn(ctx, args))`.

```ts
// convex/core/todo.ts
import { Result } from "better-result";
import type { z } from "zod";
import type { AuthenticatedMutationCtx } from "../functions";
import { todos } from "../schema";
import { ValidationError } from "./errors";

export const zCreateTodoArgs = todos.schema.pick({ title: true });
export type CreateTodoArgs = z.infer<typeof zCreateTodoArgs>;

export async function createTodoFn(ctx: AuthenticatedMutationCtx, args: CreateTodoArgs) {
	if (args.title.trim() === "") {
		return Result.err(new ValidationError({ field: "title", message: "Title is required" }));
	}
	return Result.ok(await ctx.db.insert("todos", { ...args, userId: ctx.user._id }));
}
```

```ts
// convex/todo.ts
import { createTodoFn, zCreateTodoArgs } from "./core/todo";
import { authenticatedMutation } from "./functions";
import { unwrapOrThrow } from "./lib/result";

export const create = authenticatedMutation({
	args: zCreateTodoArgs.shape,
	handler: async (ctx, args) => unwrapOrThrow(await createTodoFn(ctx, args)),
});
```

```tsx
// component
const createTodoMutation = useMutation({
	mutationFn: useConvexMutation(api.todo.create),
	// getAppError returns the core error's `_tag` and `message`
	onError: (error) => toast.error(getAppError(error).message),
});
```
