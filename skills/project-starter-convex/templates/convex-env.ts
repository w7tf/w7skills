import { createEnv } from "@t3-oss/env-core";
import { z } from "zod";

// Environment variables of the Convex deployment, set with `npx convex env set`.
// Import `env` from here instead of reading `process.env` in Convex functions.
export const env = createEnv({
	server: {},
	runtimeEnv: process.env,
	emptyStringAsUndefined: true,
});
