
## Backend: TanStack Start server functions

- Everything server-side lives in `src/server/`. Business logic: `src/server/core/<domain>.ts`. Server functions: `src/server/<domain>.ts`.
- A server function is `createServerFn(...).inputValidator(z<Name>Args).handler(...)` whose handler only returns `unwrapOrThrow(await <name>Fn(context, data))` from `src/server/lib/result.ts`.
- Never return a `Result` from a server function: it does not serialize. Throwing is the TanStack Start way. Never throw a core error directly either: TanStack Start sends its `stack` and `cause` to the browser. `unwrapOrThrow` logs it on the server and throws only `_tag` and `message`.
- Auth and request context come from middleware (`.middleware([...])`) and are passed into the `Fn` as its first argument. Core functions never read the request themselves.
- Core functions do not import from `@tanstack/react-start`. They must be callable from tests, scripts and other core functions.
- Frontend calls server functions only through TanStack Query: `useQuery({ queryKey, queryFn: () => getTodos() })`, `useMutation({ mutationFn: (data) => createTodo({ data }) })`. Branch on failures with `matchError` on the thrown error.

Example:

```ts
// src/server/core/todo.ts
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
	.handler(async ({ context, data }) => unwrapOrThrow(await createTodoFn(context, data)));

// component
const createTodoMutation = useMutation({
	mutationFn: (data: CreateTodoArgs) => createTodo({ data }),
	onError: (error) => toast.error(error.message),
});
```
