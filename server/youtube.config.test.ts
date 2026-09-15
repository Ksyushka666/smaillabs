import { describe, expect, it } from "vitest";

describe("YouTube integration configuration", () => {
  it("keeps the Data API key server-side when configured", () => {
    const key = process.env.YOUTUBE_DATA_API_KEY;
    expect(key === undefined || key.startsWith("AIza")).toBe(true);
    expect(process.env.VITE_YOUTUBE_DATA_API_KEY).toBeUndefined();
  });

  it("validates the configured key with a lightweight channel request", async () => {
    const key = process.env.YOUTUBE_DATA_API_KEY;
    if (!key) return;

    const response = await fetch(
      `https://www.googleapis.com/youtube/v3/channels?part=id&id=UCHwDOUx1FS4mtwFcZnUGyIg&key=${encodeURIComponent(key)}`
    );
    expect(response.ok).toBe(true);
    const body = (await response.json()) as { items?: Array<{ id?: string }> };
    expect(body.items?.[0]?.id).toBe("UCHwDOUx1FS4mtwFcZnUGyIg");
  }, 15000);
});
