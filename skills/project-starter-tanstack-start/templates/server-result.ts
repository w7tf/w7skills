import type { Result } from "better-result";
import { type SerializedError, serializeError } from "@/core/errors";

// What a server function returns. Results are converted to this plain shape
// because class instances do not survive serialization.
export type ServerResult<T> =
	| { ok: true; value: T }
	| { ok: false; error: SerializedError };

// Server side: the only thing a server function does with a core Result.
export function toServerResult<T, E extends { _tag: string; message: string }>(
	result: Result<T, E>,
): ServerResult<T> {
	return result.match({
		ok: (value): ServerResult<T> => ({ ok: true, value }),
		err: (error): ServerResult<T> => ({ ok: false, error: serializeError(error) }),
	});
}

// Client side: thrown into TanStack Query. Keeps `_tag`, so components can
// branch on it with `matchError`.
export class ServerFnError extends Error {
	readonly _tag: string;

	constructor(error: SerializedError) {
		super(error.message);
		this._tag = error._tag;
	}
}

// Client side: use as the queryFn / mutationFn body.
export async function unwrapServerResult<T>(
	response: Promise<ServerResult<T>>,
): Promise<T> {
	const result = await response;
	if (result.ok) return result.value;
	throw new ServerFnError(result.error);
}
