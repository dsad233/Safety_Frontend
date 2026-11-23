import react, { reactCompilerPreset } from "@vitejs/plugin-react";
import babel from "@rolldown/plugin-babel";
import { defineConfig } from "vite";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), babel({ presets: [reactCompilerPreset()] })],
  server: {
    host: true,
    port: 5173,
    open: true,
    proxy: {
      // 경로가 "/api" 로 시작하는 요청을 대상으로 proxy 설정
      "/api": {
        target: "http://localhost:3018/api",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ""),
        secure: false,
        ws: true,
      },
    },
  },
  preview: {
    host: true,
    port: 3677,
    allowedHosts: [""],
    proxy: {
      "/api": {
        target: "http://localhost:3018/api",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ""),
        secure: true,
        ws: true,
      },
    },
  },
});
