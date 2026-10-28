import type { Result } from "better-result";

// The only thing a server function does with a core Result: return the value,
// or throw the error. TanStack Start serializes thrown errors (with seroval) and
// rethrows them on the client with `_tag`, `message` and payload intact, so
// TanStack Query sees a normal failure and `matchError` still works on it.
// A Result itself cannot be returned: it is a class instance and fails
// serialization.
export function unwrapOrThrow<T, E extends Error>(result: Result<T, E>): T {
	return result.match({
		ok: (value) => value,
		err: (error) => {
			throw error;
		},
	});
}
