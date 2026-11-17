import { defineConfig } from 'astro/config';
// assetsInlineLimit 0: never inline scripts, so the Content-Security-Policy set at Cloudflare can use script-src 'self'.
export default defineConfig({ site: 'https://timotholt.com', output: 'static', vite: { build: { assetsInlineLimit: 0 } } });
