import { Result } from "better-result";

// The only thing a server function does with a core Result: return the value,
// or throw the error. TanStack Start serializes thrown errors (with seroval) and
// rethrows them on the client, so TanStack Query sees a normal failure.
// A Result itself cannot be returned: it is a class instance and fails
// serialization.
export function unwrapOrThrow<T, E extends Error & { _tag: string }>(
	result: Result<T, E>,
): T {
	// Do not throw inside `result.match`: better-result treats a throwing
	// handler as a defect and turns it into a Panic.
	if (Result.isOk(result)) return result.value;
	// Keep the full error (cause, stack, payload) in the server logs only.
	console.error(result.error);
	throw toWireError(result.error);
}

// Seroval sends every own property of a thrown error to the browser, including
// `stack` and `cause` (e.g. a database error). Send only `_tag` and `message`;
// `matchError` still works on the client because `_tag` is kept.
function toWireError(error: { _tag: string; message: string }) {
	const clientError = Object.assign(new Error(error.message), {
		_tag: error._tag,
	});
	clientError.stack = undefined;
	return clientError;
}
