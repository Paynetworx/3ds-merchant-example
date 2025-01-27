import { fileURLToPath, URL } from 'node:url'
import { createHtmlPlugin } from "vite-plugin-html";

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vitejs.dev/config/
export default defineConfig({
  base:"/static/",
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  plugins: [
    vue(),
    createHtmlPlugin({
      inject: {
        data: {
          cdnScript:
            process.env.NODE_ENV === "production"
              ? ''
              : '<script src="https://localhost:8084/index.js"></script>',
        },
      },
    }),
  ],
  build: {
    rollupOptions: {
      external: ["sdk"],
      output: {
        format: "iife",
        globals: {
          vue: "sdk",
        },
      },
    },
  },
})
