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
      }
    );
    
    expect(res.status).toBe(400);
    expect(await res.json()).toEqual({ error: "Message is required" });
  });

  it("GET /doc でOpenAPI仕様を返すこと", async () => {
    const res = await app.request("/doc");
    
    expect(res.status).toBe(200);
    const spec = await res.json();
    expect(spec.openapi).toBe("3.0.0");
    expect(spec.info.title).toBe("Zundamon AI Avatar API");
  });

  it("GET /ui でSwagger UIを返すこと", async () => {
    const res = await app.request("/ui");
    
    expect(res.status).toBe(200);
    expect(res.headers.get("content-type")).toMatch(/text\/html/);
  });
});