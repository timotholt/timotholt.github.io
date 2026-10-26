import { test, expect } from '@playwright/test';

// The type rewrite removed --sp-2/--sp-3 while Highlights still used them; an undefined var() silently made the gaps 0.
// Checked on the home page: the stylesheet is shared, and only home has the elements that set the section and rail
// variables (inline section styles, and --band/--dot-fg set by rail.ts).
for (const url of ['/']) {
  test(`every CSS variable used on ${url} is defined`, async ({ page }) => {
    await page.goto(url);
    const missing = await page.evaluate(() => {
      const css = [...document.styleSheets].flatMap(s => { try { return [...s.cssRules].map(r => r.cssText); } catch { return []; } }).join('\n');
      const inline = [...document.querySelectorAll<HTMLElement>('[style]')].map(e => e.getAttribute('style')).join(';');
      const defined = new Set([...(css + ';' + inline).matchAll(/(--[\w-]+)\s*:/g)].map(m => m[1]));
      const used = [...css.matchAll(/var\((--[\w-]+)\s*\)/g)].map(m => m[1]); // only var() without a fallback
      return [...new Set(used.filter(v => !defined.has(v)))];
    });
    expect(missing).toEqual([]);
  });
}
