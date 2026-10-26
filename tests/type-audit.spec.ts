import { test, expect, type Page } from '@playwright/test';

// Two laptop windows of the same shape: the content column grows by ~11% and nothing else changes, so every piece of
// page text (font size and padding) must grow by the same ratio (docs/TYPE-SCALE.md). Anything that doesn't is a
// hard-coded straggler.
const small = { width: 1000, height: 640 };
const large = { width: 1100, height: 704 };
const tolerance = 0.03;

// Chrome that deliberately keeps one size at every window (it isn't part of the page column): selector and reason.
const fixed: [string, string][] = [
  ['.progress-rail', 'scroll rail and its readout/tooltips: fixed-size navigation chrome'],
  ['dialog.chat', 'chat panel: a fixed-size dialog over the page'],
  ['.site-header', 'top nav: fixed-size chrome'],
  ['.site-footer', 'footer: fixed-size chrome'],
  ['.skip-link', 'skip link: keyboard-only chrome, off screen until focused'],
];

type Sample = { key: string; font: number; pad: number };

async function sample(page: Page, size: { width: number; height: number }) {
  await page.setViewportSize(size);
  await page.goto('/');
  await page.evaluate(() => document.fonts.ready);
  return page.evaluate(skip => {
    const column = document.querySelector<HTMLElement>('#skills > .wrap')!.getBoundingClientRect().width;
    const out: Sample[] = [];
    const seen = new Map<string, number>();
    for (const el of document.querySelectorAll<HTMLElement>('body *')) {
      if (skip.some(s => el.closest(s))) continue;
      if (!el.offsetParent && getComputedStyle(el).position !== 'fixed') continue;
      if (![...el.childNodes].some(n => n.nodeType === 3 && n.textContent!.trim())) continue;
      const cs = getComputedStyle(el);
      const base = `${el.tagName.toLowerCase()}.${[...el.classList].join('.')}|${el.textContent!.trim().slice(0, 24)}`;
      const n = (seen.get(base) ?? 0) + 1;
      seen.set(base, n);
      out.push({ key: `${base}#${n}`, font: parseFloat(cs.fontSize), pad: parseFloat(cs.paddingLeft) + parseFloat(cs.paddingTop) });
    }
    return { column, out };
  }, fixed.map(([s]) => s));
}

test('page text scales with the content column', async ({ page }) => {
  const a = await sample(page, small);
  const b = await sample(page, large);
  const ratio = b.column / a.column;
  expect(ratio).toBeGreaterThan(1.05);
  const big = new Map(b.out.map(s => [s.key, s]));
  const stragglers: string[] = [];
  for (const s of a.out) {
    const t = big.get(s.key);
    if (!t) continue;
    const fontRatio = t.font / s.font;
    if (Math.abs(fontRatio / ratio - 1) > tolerance) stragglers.push(`font ${s.font}px→${t.font}px  ${s.key}`);
    if (s.pad > 0.5 && Math.abs(t.pad / s.pad / ratio - 1) > tolerance) stragglers.push(`padding ${s.pad}px→${t.pad}px  ${s.key}`);
  }
  expect(stragglers).toEqual([]);
});
