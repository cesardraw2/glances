import { defineConfig } from 'vitest/config';
import { playwright } from '@vitest/browser-playwright';

export default defineConfig({
  server: {
    proxy: {
      '/hud': {
        target: 'http://localhost:61208',
        changeOrigin: true
      },
      '/api': {
        target: 'http://localhost:61208',
        changeOrigin: true
      }
    }
  },
  test: {
    globals: true,
    include: ['**/*.browser.spec.ts'],
    browser: {
      enabled: true,
      provider: playwright({
        launch: {
          args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-gpu',
            '--disable-software-rasterizer',
            '--disable-dev-shm-usage',
            '--disable-crash-reporter',
            '--disable-breakpad'
          ]
        }
      }),
      headless: true,
      instances: [
        { browser: 'chromium' }
      ]
    }
  }
});
