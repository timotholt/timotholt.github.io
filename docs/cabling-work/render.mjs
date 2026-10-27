// Renders docs/cabling-work/cabling-work.html to the one-page attachment served from public/:
// a US Letter PDF and a 300 DPI PNG (2550×3300). Run with `npm run build:cabling`.
import { chromium } from '@playwright/test';
import { fileURLToPath } from 'node:url';

const html = new URL('./cabling-work.html', import.meta.url).href;
const out = (ext) => fileURLToPath(new URL(`../../public/Timothy_Otholt_Cabling_Work.${ext}`, import.meta.url));

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 816, height: 1056 }, deviceScaleFactor: 3.125 });
await page.goto(html, { waitUntil: 'load' });
await page.screenshot({ path: out('png') });
await page.pdf({ path: out('pdf'), format: 'Letter', printBackground: true, margin: { top: 0, right: 0, bottom: 0, left: 0 } });
await browser.close();
