import { describe, expect, it } from "vitest";

describe("Discord YouTube notification configuration", () => {
  it("keeps the webhook server-side and validates its shape", () => {
    const webhook = process.env.DISCORD_YOUTUBE_WEBHOOK_URL;
    expect(webhook === undefined || /^https:\/\/discord\.com\/api\/webhooks\/\d+\/.+/.test(webhook)).toBe(true);
    expect(process.env.VITE_DISCORD_YOUTUBE_WEBHOOK_URL).toBeUndefined();
  });
});
