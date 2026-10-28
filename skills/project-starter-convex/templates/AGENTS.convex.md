
## Backend: Convex

- Convex functions live in `<convex dir>/<domain>.ts`; business logic lives in `<convex dir>/core/<domain>.ts`.
- Queries, mutations and actions are thin wrappers: Zod args (`z<Name>Args` from the core module), auth through custom functions, then `unwrapOrThrow(await <name>Fn(ctx, args))`. Nothing else.
- Core functions take the context as their first argument, typed `QueryCtx`, `MutationCtx` or `ActionCtx` (or the matching authenticated custom context). The `Fn` suffix is mandatory because the wrapper and the core function often share a name.
- Define custom functions with `zCustomQuery` / `zCustomMutation` / `zCustomAction` from `convex-helpers/server/zod4` so every function validates its args with Zod.
- When deriving arg schemas from table schemas, prefer `.pick()` over `.omit()`.
- Frontend: call Convex only through TanStack Query, `useQuery(convexQuery(api.x.y, args))` and `useMutation({ mutationFn: useConvexMutation(api.x.y) })`. Read failures with `getAppError(error)` and branch with `matchError`.

### Convex components first

Before custom-coding any backend capability (rate limiting, retries, workpools/queues, crons, aggregates/counters, migrations, sharded counters, presence, file storage helpers, auth, payments, email, search, AI agents, workflows, ...), check https://www.convex.dev/components for an existing component. If a **verified** component covers the need, use it: `pnpm add @convex-dev/<component>`, register it with `app.use(...)` in `convex.config.ts`, and wrap its API in core `<name>Fn` functions like any other dependency. Custom code is only acceptable when no verified component fits; say which components were checked and why they did not fit. Use the `components-guide` skill for details.

Example:

```ts
// convex/core/todo.ts
export const zCreateTodoArgs = todos.schema.pick({ title: true });
export type CreateTodoArgs = z.infer<typeof zCreateTodoArgs>;

export async function createTodoFn(ctx: AuthenticatedMutationCtx, args: CreateTodoArgs) {
	if (args.title.trim() === "") {
		return Result.err(new ValidationError({ field: "title", message: "Title is required" }));
	}
	return Result.ok(await ctx.db.insert("todos", { ...args, userId: ctx.user._id }));
}

// convex/todo.ts
export const create = authenticatedMutation({
	args: zCreateTodoArgs.shape,
	handler: async (ctx, args) => unwrapOrThrow(await createTodoFn(ctx, args)),
});
```
