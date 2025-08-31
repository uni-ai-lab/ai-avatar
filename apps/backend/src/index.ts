import { OpenAPIHono } from "@hono/zod-openapi";
import { swaggerUI } from "@hono/swagger-ui";
import { cors } from "hono/cors";
import type { Bindings } from "./types";
import { openApiConfig } from "./config/openapi";
import { corsConfig } from "./config/cors";
import { registerVoiceChatRoutes } from "./routes/voice-chat";

const app = new OpenAPIHono<{ Bindings: Bindings }>();

// OpenAPI documentation endpoint
app.doc("/doc", openApiConfig);

// Swagger UI endpoint
app.get("/ui", swaggerUI({ url: "/doc" }));

// CORS middleware
app.use("/*", cors(corsConfig));

// Health check endpoint
app.get("/", (c) => {
  return c.text("Hello Hono!");
});

// Register route handlers
registerVoiceChatRoutes(app);

export default app;
