
## Backend: TanStack Start server functions

- Core business logic: `src/core/<domain>.ts`. Server functions: `src/server/<domain>.ts`.
- A server function is `createServerFn(...).inputValidator(z<Name>Args).handler(...)` whose handler only calls the core `<name>Fn` and returns `toServerResult(...)` from `src/lib/server-result.ts`.
- Auth and request context come from middleware (`.middleware([...])`) and are passed into the `Fn` as its first argument. Core functions never read the request themselves.
- Core functions do not import from `@tanstack/react-start`. They must be callable from tests, scripts and other core functions.
- Frontend calls server functions only through TanStack Query, with `unwrapServerResult(...)` as the query/mutation function body.

Example:

```ts
// src/core/todo.ts
export const zCreateTodoArgs = z.object({ title: z.string().min(1) });
export type CreateTodoArgs = z.infer<typeof zCreateTodoArgs>;

export async function createTodoFn(ctx: AppContext, args: CreateTodoArgs) {
	return Result.tryPromise({
		try: () => ctx.db.insert(todos).values({ ...args, userId: ctx.user.id }).returning(),
		catch: (cause) => new TodoWriteError({ message: "Could not save todo", cause }),
	});
}

// src/server/todo.ts
export const createTodo = createServerFn({ method: "POST" })
	.middleware([authMiddleware])
	.inputValidator(zCreateTodoArgs)
	.handler(async ({ context, data }) => toServerResult(await createTodoFn(context, data)));

// component
const createTodoMutation = useMutation({
	mutationFn: (data: CreateTodoArgs) => unwrapServerResult(createTodo({ data })),
});
```
