import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

const seoHtmlProxyPlugin = () => ({
  name: 'seo-html-proxy',
  configureServer(server) {
    server.middlewares.use(async (req, res, next) => {
      const method = req.method || 'GET'
      const url = req.url || '/'
      const accept = req.headers.accept || ''

      if (method !== 'GET' && method !== 'HEAD') return next()
      if (!accept.includes('text/html')) return next()
      if (
        url.startsWith('/@vite') ||
        url.startsWith('/src/') ||
        url.startsWith('/node_modules/') ||
        url.startsWith('/assets/') ||
        url.startsWith('/api') ||
        url.startsWith('/uploads') ||
        url.startsWith('/favicon') ||
        url.includes('.')
      ) {
        return next()
      }

      try {
        const response = await fetch(`http://localhost:8000${url}`, {
          headers: {
            'x-use-vite-template': '1',
          },
        })

        if (!response.ok) {
          return next()
        }

        const html = await response.text()
        const transformedHtml = await server.transformIndexHtml(url, html, req.originalUrl)
        res.statusCode = response.status
        res.setHeader('Content-Type', 'text/html; charset=utf-8')
        res.end(transformedHtml)
      } catch {
        next()
      }
    })
  },
})

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss(), seoHtmlProxyPlugin()],

  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      },
      '/uploads': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      },
    },
  },

  build: {
    target: 'es2020',
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
      },
    },

    rollupOptions: {
      output: {
        manualChunks: {
          'vendor': ['react', 'react-dom', 'react-router-dom'],
          'redux': ['@reduxjs/toolkit', 'react-redux'],
          'forms': ['react-hook-form', '@hookform/resolvers', 'yup'],
          'editor': ['@tiptap/react', '@tiptap/starter-kit'],
        },
      },
    },

    sourcemap: false,
    chunkSizeWarningLimit: 500,
  },

  resolve: {
    alias: {
      '@': '/src',
    },
  },
})
