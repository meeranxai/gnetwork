import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ mode }) => {
  const isDev = mode === 'development'

  return {
    plugins: [react()],

    // Required for Vercel + React Router
    base: '/',

    // Dev-only proxy (production mein ignore ho jata hai)
    server: isDev
      ? {
          proxy: {
            '/api': {
              target: 'http://127.0.0.1:5000',
              changeOrigin: true,
              secure: false,
            },
            '/uploads': {
              target: 'http://127.0.0.1:5000',
              changeOrigin: true,
              secure: false,
            },
            '/socket.io': {
              target: 'http://127.0.0.1:5000',
              ws: true,
              changeOrigin: true,
            },
          },
        }
      : undefined,

    // Clean build output
    build: {
      outDir: 'dist',
      sourcemap: false,
    },
  }
})
