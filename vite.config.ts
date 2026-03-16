import { defineConfig } from 'vite'
import path from 'path'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'masked-icon.svg'],
      manifest: {
        name: 'ZodiacCycle',
        short_name: 'ZodiacCycle',
        description: 'Menstrual cycle tracking meets astrology',
        theme_color: '#c084fc',
        background_color: '#0f0a1e',
        display: 'standalone',
        orientation: 'portrait',
        scope: '/',
        start_url: '/',
        icons: [
       {
        src: 'icons/icon-96x96.png',
        sizes: '96x96',
        type: 'image/png'
       },
       {
        src: 'icons/icon-192x192.png',
    sizes: '192x192',
    type: 'image/png',
    purpose: 'any maskable'
  },
  {
    src: 'icons/icon-512x512.png',
    sizes: '512x512',
    type: 'image/png',
    purpose: 'any maskable'
  }
   ] 
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
        navigateFallback: null,
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/owmmrkowqkjbrimazftv\.supabase\.co\/.*/i,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'supabase-cache',
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 60 * 60 * 24
              }
            }
          },
          {
            urlPattern: /^https:\/\/zodiac-worker\.zodiac-app\.workers\.dev\/.*/i,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'worker-cache',
              expiration: {
                maxEntries: 20,
                maxAgeSeconds: 60 * 60 * 2
              }
            }
          }
        ]
      }
    })
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  assetsInclude: ['**/*.svg', '**/*.csv'],
})