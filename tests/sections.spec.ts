import { test, expect } from '@playwright/test';
import { sections } from '../src/data/sections';

const order = ['contact', 'highlights', 'projects', 'skills', 'jobs', 'awards', 'education', 'contact'];

const rgb = (css: string) => (css.match(/[\d.]+/g) || []).slice(0, 3).map(Number);
const hexRgb = (hex: string) => [1, 3, 5].map(offset => parseInt(hex.slice(offset, offset + 2), 16));
const luminance = (channels: number[]) => channels
  .map(v => v / 255)
  .map(v => v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4)
  .reduce((sum, v, i) => sum + v * [0.2126, 0.7152, 0.0722][i], 0);
const contrast = (a: number[], b: number[]) => {
  const [lo, hi] = [luminance(a), luminance(b)].sort((x, y) => x - y);
  return (hi + 0.05) / (lo + 0.05);
};

test('section backgrounds, rail bands, and text contrast follow one palette', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('.rail-band')).toHaveCount(order.length);
  await expect(page.locator('#theme-toggle')).toHaveCount(0);
  const actual = await page.evaluate(() => {
    const nodes = [...document.querySelectorAll<HTMLElement>('main section[data-section-key]')];
    const bands = [...document.querySelectorAll<HTMLElement>('.rail-band')].sort((a, b) => Number(a.dataset.first) - Number(b.dataset.first));
    return nodes.map((node, i) => ({
      key: node.dataset.sectionKey,
      bg: getComputedStyle(node).backgroundColor,
      fg: getComputedStyle(node).color,
      accent: getComputedStyle(node).getPropertyValue('--section-accent').trim(),
      bandBg: getComputedStyle(bands[i]).backgroundColor,
      bandKey: bands[i].dataset.sectionKey,
    }));
  });
  expect(actual.map(item => item.key)).toEqual(order);
  expect(new Set(actual.map(item => item.key))).toEqual(new Set(sections.map(item => item.key)));
  expect(actual[0].bg).toBe(actual.at(-1)?.bg);
  for (let i = 0; i < actual.length; i++) {
    const item = actual[i];
    expect(item.bandKey).toBe(item.key);
    expect(item.bg).toBe(item.bandBg);
    expect(item.bandBg).toMatch(/^rgb\(\d+, \d+, \d+\)$/);
    const palette = sections.find(section => section.key === item.key)!;
    expect(rgb(item.bg)).toEqual(hexRgb(palette.bg));
    expect(rgb(item.fg)).toEqual(hexRgb(palette.fg));
    expect(item.accent.toLowerCase()).toBe(palette.accent.toLowerCase());
    expect(contrast(rgb(item.fg), rgb(item.bg))).toBeGreaterThanOrEqual(4.5);
    const accent = hexRgb(item.accent);
    expect(contrast(accent, rgb(item.bg))).toBeGreaterThanOrEqual(4.5);
    if (i) expect(item.bg).not.toBe(actual[i - 1].bg);
  }
});

for (const viewport of [{ width: 375, height: 812 }, { width: 1440, height: 900 }]) {
  test(`Education and Awards lists fit one slot at ${viewport.width}`, async ({ page }) => {
    await page.setViewportSize(viewport);
    await page.goto('/');
    await page.evaluate(() => document.fonts.ready);
    for (const id of ['education', 'awards']) {
      const dimensions = await page.locator(`#${id}`).evaluate(section => {
        const box = section.getBoundingClientRect();
        const panel = section.querySelector('.cred-list')!.getBoundingClientRect();
        const heading = section.querySelector('h2')!.getBoundingClientRect();
        return { headingTop: heading.top - box.top, slots: section.matches('.feature-slot') ? 1 : section.querySelectorAll('.feature-slot').length, sectionHeight: box.height, panelTop: panel.top - box.top, panelBottom: box.bottom - panel.bottom };
      });
      expect(dimensions.slots).toBe(1);
      expect(Math.abs(dimensions.sectionHeight - viewport.height)).toBeLessThanOrEqual(1);
      expect(dimensions.panelTop).toBeGreaterThanOrEqual(0);
      expect(dimensions.panelBottom).toBeGreaterThanOrEqual(0);
      expect(dimensions.headingTop).toBeGreaterThanOrEqual(0);
    }
  });
}

for (const viewport of [{ width: 375, height: 812 }, { width: 660, height: 780 }, { width: 1440, height: 900 }]) {
  test(`sections are full-width rows with no gaps at ${viewport.width}`, async ({ page }) => {
    await page.setViewportSize(viewport);
    await page.goto('/');
    const rows = await page.$$eval('main > section, main > *:not(section) section', sections => sections.map(s => {
      const r = s.getBoundingClientRect();
      return { id: s.id, left: r.left, right: r.right, top: r.top + scrollY, bottom: r.bottom + scrollY };
    }));
    const width = await page.evaluate(() => document.documentElement.clientWidth);
    for (const row of rows) {
      expect(Math.abs(row.left), row.id).toBeLessThanOrEqual(1);
      expect(Math.abs(row.right - width), row.id).toBeLessThanOrEqual(1);
    }
    for (let i = 1; i < rows.length; i++) expect(Math.abs(rows[i].top - rows[i - 1].bottom), `${rows[i - 1].id} → ${rows[i].id}`).toBeLessThanOrEqual(1);
  });
}

for (const viewport of [{ width: 375, height: 812 }, { width: 1440, height: 900 }]) {
  test(`job pages hold three jobs and fit their slot at ${viewport.width}`, async ({ page }) => {
    await page.setViewportSize(viewport);
    await page.goto('/');
    await page.evaluate(() => document.fonts.ready);
    // Layout offsets ignore the entrance transforms, so this measures the settled layout.
    const pages = await page.$$eval('.job-page', slots => slots.map(slot => {
      const list = slot.querySelector<HTMLElement>('.job-list')!;
      const heading = slot.querySelector<HTMLElement>('.section-heading');
      return { jobs: list.children.length, top: heading ? heading.offsetTop : list.offsetTop, bottom: list.offsetTop + list.offsetHeight, height: slot.clientHeight };
    }));
    expect(pages.map(p => p.jobs)).toEqual([3, 3, 3]);
    for (const p of pages) {
      expect(p.top).toBeGreaterThanOrEqual(0);
      expect(p.bottom).toBeLessThanOrEqual(p.height);
    }
  });
}
