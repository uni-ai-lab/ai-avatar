import type { OpenAPIHono } from "@hono/zod-openapi";
import type { Bindings } from "../types";
import { voiceChatRouteDefinition } from "../schemas/voice-chat";
import { handleVoiceChat } from "../controllers/voice-chat";

/**
 * Registers voice chat routes with the Hono app
 */
export function registerVoiceChatRoutes(app: OpenAPIHono<{ Bindings: Bindings }>) {
  app.openapi(voiceChatRouteDefinition, handleVoiceChat);
}