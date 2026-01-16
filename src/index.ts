import { App, HTTPReceiver } from "@slack/bolt";
import { httpServerHandler } from "cloudflare:node";

const PORT = 3000;

// Get secrets from environment - these should be set as Wrangler secrets
// Run: wrangler secret put SLACK_SIGNING_SECRET
// Run: wrangler secret put SLACK_BOT_TOKEN
const signingSecret = process.env.SLACK_SIGNING_SECRET || "test-signing-secret";
const botToken = process.env.SLACK_BOT_TOKEN || "xoxb-test-token";

// Create the HTTPReceiver
const receiver = new HTTPReceiver({
	signingSecret,
	port: PORT,
	// Disable signature verification for local testing only
	// In production with real secrets, set this to true
	signatureVerification: signingSecret !== "test-signing-secret",
});

// Create the Bolt app with a custom authorize function
// This avoids the auth.test API call that would fail in global scope
const app = new App({
	receiver,
	authorize: async () => ({
		botToken,
		botId: "B_TEST", // You can get this from your Slack app settings
		botUserId: "U_TEST", // You can get this from your Slack app settings
	}),
});

// Example: Respond to messages containing "hello"
app.message("hello", async ({ message, say }) => {
	await say("Hey there! Bolt is running on Cloudflare Workers!");
});

// Example: Handle /echo slash command
app.command("/echo", async ({ command, ack, respond }) => {
	await ack();
	await respond(`You said: ${command.text}`);
});

// Example: Handle button clicks
app.action("button_click", async ({ body, ack, respond }) => {
	await ack();
	if (respond) {
		await respond("Button was clicked!");
	}
});

// Start the HTTP server
receiver.start(PORT);

// Export the handler - bridges Cloudflare Worker fetch to Node.js HTTP server
export default httpServerHandler({ port: PORT });
