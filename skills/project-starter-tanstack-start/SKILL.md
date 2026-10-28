---
name: project-starter-tanstack-start
description: Set up a new TanStack Start project without Convex. Runs the project-starter-core setup, then scaffolds src/server/core <name>Fn business logic behind thin createServerFn wrappers with better-result. Use when starting or bootstrapping a TanStack Start app without Convex, or a new project that names TanStack Start alone.
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
2. Check which input validator method the installed TanStack Start has: newer versions use
   `.inputValidator(...)`, older ones `.validator(...)`. Look it up in the installed types, e.g.
   `grep -rl "inputValidator" node_modules/@tanstack/*start*/dist`; no match means `.validator`.
   Use that method everywhere below, including the examples.
3. Append [templates/AGENTS.tanstack-start.md](templates/AGENTS.tanstack-start.md) to the
   project's `AGENTS.md`, replacing `.inputValidator` with `.validator` if step 2 found the
   older method.
4. Put the server-only secrets the server functions need (database URL, API keys) in the `server`
   schema of `src/env.ts`, and import `env` in core functions instead of reading `process.env`.
5. If the project has auth, create `src/server/middleware.ts` with an `authMiddleware` built with
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

1. Validates input with the core module's `z<Name>Args` schema (`.inputValidator(...)`, or `.validator(...)` on older TanStack Start versions).
2. Gets auth and request context from middleware.
3. Calls the core `<name>Fn(context, data)`.
4. Returns `unwrapOrThrow(result)`: the value, or the core error thrown.

This follows TanStack Start's own error model: a server function throws, and the client gets the
error rethrown. A `Result` cannot be returned instead, because it is a class instance and fails
serialization. TanStack Start serializes thrown errors with seroval, which would send every own
property, including `stack` and `cause` (e.g. a database error), to the browser. So
`unwrapOrThrow` logs the full error on the server and throws a plain `Error` with only `_tag` and
`message`. On the client, `toClientError` (from core `errors.ts`) turns it into a `ClientError`
for exhaustive `matchError`.

```ts
// src/server/core/todo.ts
import { Result, TaggedError } from "better-result";
import * as z from "zod";

export class TodoWriteError extends TaggedError("TodoWriteError")<{
	message: string;
	cause: unknown;
}> {}

export const zCompleteTodoArgs = z.object({ id: z.string() });
export type CompleteTodoArgs = z.infer<typeof zCompleteTodoArgs>;

export function completeTodoFn(ctx: AppContext, args: CompleteTodoArgs) {
	return Result.gen(async function* () {
		const todo = yield* Result.await(findTodoFn(ctx, args.id)); // NotFoundError
		yield* Result.await(
			Result.tryPromise({
				try: () => ctx.db.update(todos).set({ done: true }).where(eq(todos.id, todo.id)),
				catch: (cause) => new TodoWriteError({ message: "Could not update todo", cause }),
			}),
		);
		return Result.ok({ ...todo, done: true });
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
// route: prefetch on the server, read with suspense
const todosQuery = queryOptions({ queryKey: ["todos"], queryFn: () => getTodos() });

export const Route = createFileRoute("/todos")({
	loader: ({ context }) => context.queryClient.ensureQueryData(todosQuery),
	component: Todos,
});

function Todos() {
	const { data: todos } = useSuspenseQuery(todosQuery);
	const completeTodoMutation = useMutation({
		mutationFn: (data: CompleteTodoArgs) => completeTodo({ data }),
		// toClientError gives a closed `_tag` union, so this match is exhaustive
		onError: (error) =>
			matchError(toClientError(error), {
				NotFoundError: (e) => toast.error(e.message),
				UnauthorizedError: () => toast.error("Please sign in"),
				ForbiddenError: (e) => toast.error(e.message),
				ValidationError: (e) => toast.error(e.message),
				UnknownError: () => toast.error("Something went wrong"),
			}),
	});
	// ...
}
```
