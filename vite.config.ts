import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  server: {
    open: true, // 自动打开浏览器
    port: 5173,
    host: true
  },
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['vite.svg', 'icon.svg'],
      manifest: {
        name: '失语症沟通助手 | Aphasia Assistant',
        short_name: '沟通助手',
        description: '为失语症患者提供语音沟通辅助',
        theme_color: '#fafafa',
        background_color: '#fafafa',
        display: 'standalone',
        icons: [
          {
            src: 'icon.svg',
            sizes: 'any',
            type: 'image/svg+xml',
            purpose: 'any'
          },
          {
            src: 'icon.svg',
            sizes: 'any',
            type: 'image/svg+xml',
            purpose: 'maskable'
          }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg}'],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/api\.groq\.com\/.*/i,
            handler: 'NetworkOnly',
            options: {
              cacheName: 'groq-api-cache',
            },
          },
        ],
      },
      devOptions: {
        enabled: true
      }
    })
  ]
})

