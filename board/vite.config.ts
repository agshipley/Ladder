import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Offline board. No proxy, no external hosts — reads only the baked-in data.json
// produced by build-data.mjs (run via the `gen` npm script before dev/build).
export default defineConfig({
  plugins: [react()],
  server: { port: 5175, open: false },
});
