import { defineTable } from "convex/server";
import { zid, zodToConvex } from "convex-helpers/server/zod4";
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
		insertSchema: fullSchema.partial({
			_id: true,
			_creationTime: true,
		}),
		updateSchema: fullSchema.omit({ _id: true, _creationTime: true }).partial(),
		table: () => {
			// Convex adds system fields; table validators describe writable fields.
			return defineTable(zodToConvex(z.object(schema)));
		},
	};
};
