import { ConvexError } from "convex/values";
import { type ClientError, toClientError } from "@backend/core/errors";

// Client side: read the core error out of a failed Convex call. The result has
// a closed `_tag` union, so `matchError` on it is exhaustive.
export function getAppError(error: unknown): ClientError {
	return toClientError(error instanceof ConvexError ? error.data : error);
}
