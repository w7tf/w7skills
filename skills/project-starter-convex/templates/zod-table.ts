import { defineTable } from "convex/server";
import { zid, zodOutputToConvex } from "convex-helpers/server/zod4";
import * as z from "zod";

export const zodTable = <
	Table extends string,
	T extends { [key: string]: z.ZodType },
>(
	tableName: Table,
	schema: T,
) => {
	const fullSchema = z.object({
		...schema,
		_id: zid(tableName),
		_creationTime: z.number(),
	});

	return {
		tableName,
		schema: fullSchema,
		// Convex sets `_id` and `_creationTime`; `db.insert` rejects them.
		insertSchema: z.object(schema),
		updateSchema: fullSchema.omit({ _id: true, _creationTime: true }).partial(),
		table: () => {
			// Convex adds system fields; table validators describe writable fields.
			// The output type is what gets stored, so defaults and transforms apply.
			return defineTable(zodOutputToConvex(z.object(schema)));
		},
	};
};
