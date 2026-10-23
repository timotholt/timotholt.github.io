import { defineConfig } from '@playwright/test';
export default defineConfig({
  testDir: './tests',
  timeout: 180_000,
  use: { baseURL: 'http://127.0.0.1:4400', browserName: 'chromium' },
  // The chat URL is a placeholder that tests/chat.spec.ts intercepts; no real Worker is called.
  webServer: { command: 'npm run build && npx astro preview --host 127.0.0.1 --port 4400', url: 'http://127.0.0.1:4400', reuseExistingServer: true, timeout: 120_000, env: { PUBLIC_CHAT_URL: 'https://chat.test/chat' } },
});
