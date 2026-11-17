import { defineConfig } from 'astro/config';
// Never inline scripts (assetsInlineLimit 0) or stylesheets (inlineStylesheets 'never'), so the
// Content-Security-Policy set at Cloudflare can use script-src 'self' and style-src 'self'.
export default defineConfig({ site: 'https://timotholt.com', output: 'static', build: { inlineStylesheets: 'never' }, vite: { build: { assetsInlineLimit: 0 } } });
