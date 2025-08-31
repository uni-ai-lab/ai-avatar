/**
 * CORS configuration for the AI Avatar API
 */
export const corsConfig = {
  origin: ["http://localhost:5173"],
  allowMethods: ["GET", "POST"],
  allowHeaders: ["Content-Type"],
} as const;