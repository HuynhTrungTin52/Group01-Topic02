import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'
import path from 'path'

export default defineConfig({
  // ĐOẠN NÀY DẠY VITE HIỂU CHỮ @ LÀ THƯ MỤC SRC NÈ
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      devOptions: {
        enabled: true 
      },
      manifest: {
        name: 'TDTU PWA Advanced Dashboard',
        short_name: 'Task Manager',
        description: 'Midterm project for PWA course',
        theme_color: '#ffffff',
        background_color: '#f0f4f8',
        icons: [
          {
            src: '/pwa-128x128.png',
            sizes: '128x128',
            type: 'image/png'
          },
          {
            src: '/pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      }
    })
  ]
})