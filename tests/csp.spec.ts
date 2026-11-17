import { test, expect } from '@playwright/test';
import headers from '../security-headers.json' with { type: 'json' };

// The live site gets its Content-Security-Policy from Cloudflare (see security-headers.json).
// Serve every page under that same policy and fail on any violation, so a change that needs
// a new origin or an inline script is caught here instead of breaking the live site.
const CHAT_ORIGIN = 'https://chat.test'; // tests build with PUBLIC_CHAT_URL=https://chat.test/chat
const policy = headers['Content-Security-Policy'].replace('connect-src ', `connect-src ${CHAT_ORIGIN} `);

const pages = ['/', '/404.html', '/projects/bookstore/', '/projects/solid-tree/', '/projects/mcp-logger/', '/projects/firmware-calgen/'];

for (const path of pages) {
  test(`${path} runs under the site Content-Security-Policy with no violations`, async ({ page }) => {
    await page.route(url => url.pathname === path || url.pathname === `${path}index.html`, async route => {
      const res = await route.fetch();
      await route.fulfill({ response: res, headers: { ...res.headers(), 'content-security-policy': policy } });
    });
    await page.addInitScript(() => {
      (window as unknown as { cspViolations: string[] }).cspViolations = [];
      document.addEventListener('securitypolicyviolation', e =>
        (window as unknown as { cspViolations: string[] }).cspViolations.push(`${e.effectiveDirective} ${e.blockedURI}`));
    });
    await page.goto(path);
    if (path === '/') {
      await page.locator('.hero [data-open-chat]').click();
      await expect(page.locator('#ask-ai')).toBeVisible();
    }
    await page.mouse.wheel(0, 2000);
    await page.waitForTimeout(500);
    expect(await page.evaluate(() => (window as unknown as { cspViolations: string[] }).cspViolations)).toEqual([]);
  });
}
