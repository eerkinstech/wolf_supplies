import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

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

export default defineConfig({
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  plugins: [react(), tailwindcss(), seoHtmlProxyPlugin()],
  build: {
    target: 'es2020',
    minify: 'terser',
    cssMinify: true,
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
      },
      mangle: true,
      format: {
        comments: false,
      },
    },
    sourcemap: false,
    chunkSizeWarningLimit: 1000,
    reportCompressedSize: false,
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          if (id.includes('node_modules')) {
            if (id.includes('@tiptap') || id.includes('prosemirror')) {
              return 'editor';
            }

            if (
              id.includes('@reduxjs/toolkit') ||
              id.includes('react-redux') ||
              id.includes('redux')
            ) {
              return 'state';
            }
          }
        },
      },
    },
  },
  server: {
    middlewareMode: false,
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
    hmr: {
      protocol: 'ws',
      host: 'localhost',
      port: 5173,
    },
  },
  // Aggressive dependency optimization
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      'axios',
      '@reduxjs/toolkit',
      'react-redux',
      'react-hot-toast',
      'react-helmet-async',
    ],
    exclude: ['@tiptap/pm'],
  },
})
