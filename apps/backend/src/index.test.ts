import { describe, it, expect } from "vitest";
import app from "./index";

describe("Backend API", () => {
  it("POST /api/zundamon/voice-chat がメッセージなしでエラーを返すこと", async () => {
    const res = await app.request(
      "/api/zundamon/voice-chat",
      {
        method: "POST",
        headers: new Headers({ "Content-Type": "application/json" }),
        body: JSON.stringify({}),
      },
      {
        OPENAI_API_KEY: "test-api-key",
      },
    );

    expect(res.status).toBe(400);
    const json: unknown = await res.json();
    expect(json).toMatchObject({
      success: false,
      error: {
        name: "ZodError",
      },
    });
  });
});
