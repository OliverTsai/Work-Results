import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vitejs.dev/config/
export default defineConfig({
    base: './',
    plugins: [
        vue(),
    ],
    resolve: {
        alias: {
            '@': fileURLToPath(new URL('../src', import.meta.url))
        }
    },
    server: {
        host: '0.0.0.0',
        port: 8082,
        historyApiFallback: {
            rewrites: [
                { from: /^\/Work-Results\/.*$/, to: '/Work-Results/index.html' }
            ]
        }
    },
    test: {
    // Vitest 配置
    globals: true,
    environment: 'happy-dom', // 或 'jsdom'
    coverage: {
      provider: 'v8', // 或 'istanbul'
      reporter: ['text', 'json', 'html'],
    },
    include: ['**/*.{test,spec}.{js,ts,jsx,tsx}'],
    exclude: ['node_modules', 'dist', '.idea', '.git', '.cache'],
  }
})
