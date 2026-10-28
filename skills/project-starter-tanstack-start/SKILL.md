---
name: project-starter-tanstack-start
description: Set up a new TanStack Start project without Convex. Runs the project-starter-core setup, then scaffolds src/server/core <name>Fn business logic behind thin createServerFn wrappers with better-result. Use when starting or bootstrapping a TanStack Start app that does not use Convex.
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

- core folder: `src/server/core/` (put `errors.ts` there)
- server functions: `src/server/`

Core lives inside `src/server/` because it is server-only code.

## 3. TanStack Start specifics

1. Copy [templates/result.ts](templates/result.ts) to `src/server/lib/result.ts`.
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
  server/
    core/        business logic: <name>Fn functions, z<Name>Args schemas, domain errors
      errors.ts
      todo.ts
    lib/
      result.ts  unwrapOrThrow
    middleware.ts
    todo.ts      createServerFn wrappers only
```

A wrapper does four things and nothing else:

1. Validates input with the core module's `z<Name>Args` schema (`.inputValidator(...)`).
2. Gets auth and request context from middleware.
3. Calls the core `<name>Fn(context, data)`.
4. Returns `unwrapOrThrow(result)`: the value, or the core error thrown.

This follows TanStack Start's own error model: a server function throws, and the client gets the
error rethrown. A `Result` cannot be returned instead, because it is a class instance and fails
serialization. TanStack Start serializes thrown errors with seroval, which would send every own
property, including `stack` and `cause` (e.g. a database error), to the browser. So
`unwrapOrThrow` logs the full error on the server and throws a plain `Error` with only `_tag` and
`message`, which still works with `matchError` on the client.

```ts
// src/server/core/todo.ts
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
import { completeTodoFn, zCompleteTodoArgs } from "./core/todo";
import { unwrapOrThrow } from "./lib/result";
import { authMiddleware } from "./middleware";

export const completeTodo = createServerFn({ method: "POST" })
	.middleware([authMiddleware])
	.inputValidator(zCompleteTodoArgs)
	.handler(async ({ context, data }) => unwrapOrThrow(await completeTodoFn(context, data)));
```

```tsx
// component
const completeTodoMutation = useMutation({
	mutationFn: (data: CompleteTodoArgs) => completeTodo({ data }),
	// the core error, rethrown on the client with only `_tag` and `message`
	onError: (error) => toast.error(error.message),
});
```
