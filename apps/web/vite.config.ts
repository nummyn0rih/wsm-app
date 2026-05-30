import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

// PWA: precache app shell + runtime read-cache for GET API (offline = read-only in MVP).
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'WSM — Учёт отгрузок',
        short_name: 'WSM',
        theme_color: '#1a6b3a',
        background_color: '#f4f5f3',
        display: 'standalone',
        icons: [],
      },
      workbox: {
        navigateFallback: '/index.html',
        runtimeCaching: [
          {
            urlPattern: ({ url, request }) =>
              request.method === 'GET' && url.pathname.startsWith('/api'),
            handler: 'NetworkFirst',
            options: {
              cacheName: 'wsm-api-read',
              expiration: { maxEntries: 200, maxAgeSeconds: 60 * 60 * 24 },
            },
          },
        ],
      },
    }),
  ],
  // 5173 занят соседним проектом → 5174. Проксируем API через тот же origin (/api),
  // чтобы браузеру (в т.ч. из Windows через WSL) хватало одного порта и cookie был same-origin.
  server: {
    host: true,          // bind all interfaces — WSL2→Windows доступ по eth0 IP
    port: 5180,
    strictPort: true,
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
        rewrite: (p) => p.replace(/^\/api/, ''),
      },
    },
  },
});
