import { TaggedError } from "better-result";

// Shared errors returned by core <name>Fn functions.
// Add domain-specific errors next to the core module that returns them.

export class NotFoundError extends TaggedError("NotFoundError")<{
	resource: string;
	id: string;
	message: string;
}> {}

export class UnauthorizedError extends TaggedError("UnauthorizedError")<{
	message: string;
}> {}

export class ForbiddenError extends TaggedError("ForbiddenError")<{
	message: string;
}> {}

export class ValidationError extends TaggedError("ValidationError")<{
	field?: string;
	message: string;
}> {}

export type AppError =
	| NotFoundError
	| UnauthorizedError
	| ForbiddenError
	| ValidationError;

// The plain shape an error takes when it crosses the wire. It keeps `_tag`, so
// the client can still use `matchError` on it.
export type SerializedError = { _tag: string; message: string };

export function serializeError(error: {
	_tag: string;
	message: string;
}): SerializedError {
	return { _tag: error._tag, message: error.message };
}
