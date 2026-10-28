---
name: project-starter-tanstack-start
description: Set up a new TanStack Start project without Convex. Runs the project-starter-core setup, then scaffolds src/core <name>Fn business logic behind thin createServerFn wrappers with better-result. Use when starting or bootstrapping a TanStack Start app that does not use Convex.
---

# Project starter: TanStack Start (no Convex)

Sets up a TanStack Start project where server functions are thin wrappers over core `<name>Fn`
functions. If the project uses Convex, use `project-starter-convex` instead.

Run every step against the target project. When a step is already done, skip it and say so.

## 1. Scaffold the app (only if the folder is empty)

```bash
pnpm create @tanstack/start@latest <name>
```

Pick React, Tailwind and the TanStack Query add-on when the CLI asks. Use the package manager the
user asked for; otherwise pnpm.

## 2. Run the core setup

Load the `project-starter-core` skill (installed alongside this one; if it is not, read
`../project-starter-core/SKILL.md`) and run all of its steps. Use these locations for its
core-folder step:

- core folder: `src/core/` (put `errors.ts` there)
- server functions: `src/server/`

## 3. TanStack Start specifics

1. Copy [templates/server-result.ts](templates/server-result.ts) to `src/lib/server-result.ts`.
   Fix the `@/core/errors` import if the project uses a different alias.
2. Append [templates/AGENTS.tanstack-start.md](templates/AGENTS.tanstack-start.md) to the
   project's `AGENTS.md`.
3. Put the server-only secrets the server functions need (database URL, API keys) in the `server`
   schema of `src/env.ts`, and import `env` in core functions instead of reading `process.env`.
4. If the project has auth, create `src/server/middleware.ts` with an `authMiddleware` built with
   `createMiddleware({ type: "function" })` that resolves the user and passes it on via
   `next({ context: { user } })`. If there is no auth yet, leave a comment in
   `src/server/middleware.ts` saying where it goes and skip it.

## 4. Verify and report

Run the typecheck, fix anything the setup broke, and summarize for the user as described in the
core skill.

## The thin-wrapper pattern

```
src/
  core/        business logic: <name>Fn functions, z<Name>Args schemas, domain errors
    errors.ts
    todo.ts
  server/      createServerFn wrappers only
    middleware.ts
    todo.ts
  lib/
    server-result.ts
```

A wrapper does four things and nothing else:

1. Validates input with the core module's `z<Name>Args` schema (`.inputValidator(...)`).
2. Gets auth and request context from middleware.
3. Calls the core `<name>Fn(context, data)`.
4. Returns `toServerResult(result)`.

```ts
// src/core/todo.ts
import { Result, TaggedError } from "better-result";
import { z } from "zod";

export class TodoWriteError extends TaggedError("TodoWriteError")<{
	message: string;
	cause: unknown;
}> {}

export const zCompleteTodoArgs = z.object({ id: z.string() });
export type CompleteTodoArgs = z.infer<typeof zCompleteTodoArgs>;

export async function completeTodoFn(ctx: AppContext, args: CompleteTodoArgs) {
	const found = await findTodoFn(ctx, args.id); // Result<Todo, NotFoundError>
	if (Result.isError(found)) return found;

	return Result.tryPromise({
		try: () => ctx.db.update(todos).set({ done: true }).where(eq(todos.id, found.value.id)),
		catch: (cause) => new TodoWriteError({ message: "Could not update todo", cause }),
	});
}
```

```ts
// src/server/todo.ts
import { createServerFn } from "@tanstack/react-start";
import { completeTodoFn, zCompleteTodoArgs } from "@/core/todo";
import { toServerResult } from "@/lib/server-result";
import { authMiddleware } from "./middleware";

export const completeTodo = createServerFn({ method: "POST" })
	.middleware([authMiddleware])
	.inputValidator(zCompleteTodoArgs)
	.handler(async ({ context, data }) => toServerResult(await completeTodoFn(context, data)));
```

```tsx
// component
const completeTodoMutation = useMutation({
	mutationFn: (data: CompleteTodoArgs) => unwrapServerResult(completeTodo({ data })),
	// error is a ServerFnError: it keeps the core error's `_tag` and `message`
	onError: (error) => toast.error(error.message),
});
```
