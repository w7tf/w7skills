import { createEnv } from "@t3-oss/env-core";
import * as z from "zod";

// The only place environment variables are read. Import `env` from here
// instead of using `process.env` or `import.meta.env` directly.
export const env = createEnv({
	server: {
		NODE_ENV: z
			.enum(["development", "test", "production"])
			.default("development"),
	},

	// Vite only exposes variables with this prefix to the browser.
	clientPrefix: "VITE_",
	client: {},

	// Server variables come from process.env, client variables from Vite.
	runtimeEnv: {
		...(typeof process === "undefined" ? {} : process.env),
		...import.meta.env,
	},

	// Accessing a server variable in the browser throws instead of leaking it.
	isServer: typeof window === "undefined",
	emptyStringAsUndefined: true,
});
