/// <reference types="vitest/config" />
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    strictPort: true,
  },
  test: {
    setupFiles: ["./src/i18n/setupTests.ts"],
  },
});
