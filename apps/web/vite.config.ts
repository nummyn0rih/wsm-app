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
              request.method === 'GET' && /localhost:3001/.test(url.href),
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
  server: { port: 5173 },
});
