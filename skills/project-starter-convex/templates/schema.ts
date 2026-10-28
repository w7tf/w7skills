import { defineSchema } from "convex/server";
import * as z from "zod";
import { zodTable } from "./lib/zod-table";

// Every table is defined in Zod with zodTable. Core modules derive their
// arg schemas from `<table>.schema` / `<table>.insertSchema` with `.pick()`.
export const todos = zodTable("todos", {
	title: z.string().min(1).max(200),
	done: z.boolean(),
});

export default defineSchema({
	todos: todos.table(),
});
