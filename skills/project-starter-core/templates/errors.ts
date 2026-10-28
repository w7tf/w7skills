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

// The plain shape an error takes when it crosses the wire.
export type SerializedError = { _tag: string; message: string };

export function serializeError(error: {
	_tag: string;
	message: string;
}): SerializedError {
	return { _tag: error._tag, message: error.message };
}

// Tags the frontend matches on. Add a domain error's tag here when the UI
// handles it; any other tag reaches the client as "UnknownError".
export const clientErrorTags = [
	"NotFoundError",
	"UnauthorizedError",
	"ForbiddenError",
	"ValidationError",
] as const;

export type ClientErrorTag = (typeof clientErrorTags)[number] | "UnknownError";

// A failed call as the frontend sees it. `_tag` is a closed union, so
// `matchError(toClientError(error), { ... })` is exhaustive and a new tag
// fails the typecheck.
export type ClientError = {
	[Tag in ClientErrorTag]: Error & { readonly _tag: Tag };
}[ClientErrorTag];

export function toClientError(value: unknown): ClientError {
	const message =
		typeof value === "object" && value !== null && "message" in value
			? String(value.message)
			: String(value);
	const tag =
		typeof value === "object" && value !== null && "_tag" in value
			? String(value._tag)
			: "";
	const known = (clientErrorTags as readonly string[]).includes(tag);
	return Object.assign(new Error(message), {
		_tag: known ? tag : "UnknownError",
	}) as ClientError;
}
