import { defineConfig } from "vitest/config";

export default defineConfig({
	test: {
		// Use Node.js environment for integration tests with unstable_dev
		environment: "node",
		// Increase timeout for worker startup
		testTimeout: 30000,
	},
});
