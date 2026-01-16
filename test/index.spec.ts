import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { unstable_dev } from "wrangler";
import type { Unstable_DevWorker } from "wrangler";

describe("Bolt.js Slack Worker", () => {
	let worker: Unstable_DevWorker;

	beforeAll(async () => {
		worker = await unstable_dev("src/index.ts", {
			experimental: { disableExperimentalWarning: true },
		});
	});

	afterAll(async () => {
		await worker?.stop();
	});

	it("responds to URL verification challenge", async () => {
		const response = await worker.fetch("/slack/events", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({
				type: "url_verification",
				challenge: "test-challenge-abc123",
			}),
		});

		expect(response.status).toBe(200);
		const json = await response.json();
		expect(json).toEqual({ challenge: "test-challenge-abc123" });
	});

	it("responds to SSL check", async () => {
		const response = await worker.fetch("/slack/events", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ ssl_check: "1" }),
		});

		expect(response.status).toBe(200);
	});

	it("accepts event callbacks", async () => {
		const response = await worker.fetch("/slack/events", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({
				type: "event_callback",
				event: {
					type: "message",
					text: "hello",
					channel: "C123456",
					user: "U123456",
					ts: "1234567890.123456",
				},
				team_id: "T123456",
				api_app_id: "A123456",
				event_id: "Ev123456",
				event_time: 1234567890,
			}),
		});

		expect(response.status).toBe(200);
	});

	it("accepts slash commands", async () => {
		const response = await worker.fetch("/slack/events", {
			method: "POST",
			headers: { "Content-Type": "application/x-www-form-urlencoded" },
			body: new URLSearchParams({
				command: "/echo",
				text: "Hello Workers",
				user_id: "U123",
				team_id: "T123",
				channel_id: "C123",
				response_url: "https://hooks.slack.com/commands/test",
			}).toString(),
		});

		expect(response.status).toBe(200);
	});
});
