import type { Result } from "better-result";
import { ConvexError } from "convex/values";
import { type SerializedError, serializeError } from "../core/errors";

// The only thing a query, mutation or action does with a core Result:
// return the value, or throw a ConvexError carrying the serialized error.
// ConvexError data reaches the client intact, `_tag` included.
export function unwrapOrThrow<T, E extends { _tag: string; message: string }>(
	result: Result<T, E>,
): T {
	return result.match({
		ok: (value) => value,
		err: (error) => {
			// Keep the full error (cause, payload) in the Convex logs only.
			console.error(error);
			throw new ConvexError<SerializedError>(serializeError(error));
		},
	});
}
