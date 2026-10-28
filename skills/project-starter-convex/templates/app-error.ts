import { ConvexError } from "convex/values";
import type { SerializedError } from "@backend/core/errors";

// Client side: read the serialized core error out of a failed Convex call.
// The result keeps `_tag`, so it can be passed to `matchError`.
export function getAppError(error: unknown): SerializedError {
	if (error instanceof ConvexError) return error.data as SerializedError;
	return {
		_tag: "UnknownError",
		message: error instanceof Error ? error.message : String(error),
	};
}
