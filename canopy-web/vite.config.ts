import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: 11274,
    proxy: {
      "/kroki": {
        target: "http://localhost:8000",
        rewrite: (path) => path.replace(/^\/kroki/, ""),
      },
      "/canopy": {
        target: "http://localhost:17432",
        rewrite: (path) => path.replace(/^\/canopy/, ""),
      },
    },
  },
});
