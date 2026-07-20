import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    coverage: { enabled: false },
    environment: "node",
    include: ["core/test/**/*.test.ts", "services/*/test/**/*.test.ts"],
  },
});
