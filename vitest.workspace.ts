import { defineWorkspace } from "vitest/config";

export default defineWorkspace([
  "apps/frontend/vitest.config.ts",
  "apps/backend/vitest.config.ts",
]);