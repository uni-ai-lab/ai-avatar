import { describe, it, expect } from "vitest";
import app from "./index";

describe("Backend API", () => {
  it("POST /api/zundamon/voice-chat がメッセージなしでエラーを返すこと", async () => {
    const res = await app.request("/api/zundamon/voice-chat", {
      method: "POST",
      headers: new Headers({ "Content-Type": "application/json" }),
      body: JSON.stringify({}),
    });
    
    expect(res.status).toBe(400);
    expect(await res.json()).toEqual({ error: "Message is required" });
  });
});