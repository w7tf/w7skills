import { Result } from "better-result";
import { ConvexError } from "convex/values";
import { type SerializedError, serializeError } from "../core/errors";

// The only thing a query, mutation or action does with a core Result:
// return the value, or throw a ConvexError carrying the serialized error.
// ConvexError data reaches the client intact, `_tag` included.
export function unwrapOrThrow<T, E extends { _tag: string; message: string }>(
	result: Result<T, E>,
): T {
	// Do not throw inside `result.match`: better-result treats a throwing
	// handler as a defect and turns it into a Panic.
	if (Result.isOk(result)) return result.value;
	// Keep the full error (cause, payload) in the Convex logs only.
	console.error(result.error);
	throw new ConvexError<SerializedError>(serializeError(result.error));
}
