import react from "@vitejs/plugin-react";
import { defineConfig, loadEnv } from "vite";

import { cloudflare } from "@cloudflare/vite-plugin";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const kasaneTarget = env.VITE_KASANE_API_BASE_URL || "http://localhost:5173";

  return {
    plugins: [react(), cloudflare()],
    server: {
      proxy: {
        "/kasane": {
          target: kasaneTarget,
          changeOrigin: true,
          rewrite: (path: string) => path.replace(/^\/kasane/, ""),
        },
      },
    },
  };
});