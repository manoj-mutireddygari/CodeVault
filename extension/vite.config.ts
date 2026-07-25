import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { resolve } from "node:path";

export default defineConfig({
  plugins: [react()],
  build: { outDir: "dist", emptyOutDir: true, rollupOptions: { input: {
    popup: resolve(__dirname, "popup.html"), options: resolve(__dirname, "options.html"), background: resolve(__dirname, "src/background/index.ts"), content: resolve(__dirname, "src/content/index.ts"), pageScript: resolve(__dirname, "src/content/pageScript.ts"), dashboardBridge: resolve(__dirname, "src/content/dashboardBridge.ts")
  }, output: { entryFileNames: "assets/[name].js" } } }
});
