import { test, expect } from '@playwright/test';
import { sections } from '../src/data/sections';

const order = ['contact', 'highlights', 'projects', 'skills', 'jobs-since', 'jobs-eng', 'education', 'awards', 'contact'];

for (const theme of ['light', 'dark'] as const) {
  test(`section color and rail bands match in ${theme} theme`, async ({ page }) => {
    await page.goto('/');
    if (theme === 'dark') await page.getByRole('button', { name: 'Switch to dark theme' }).click();
    await expect(page.locator('.rail-band')).toHaveCount(order.length);
    // Band colors fade when the current section changes; measure settled values.
    await page.addStyleTag({ content: '.rail-band{transition:none!important}' });
    const actual = await page.evaluate(() => {
      const nodes = [...document.querySelectorAll<HTMLElement>('main section[data-section-key]')];
      const bands = [...document.querySelectorAll<HTMLElement>('.rail-band')].sort((a, b) => Number(a.dataset.first) - Number(b.dataset.first));
      // Parse the computed background ("rgb(...)", "rgba(...)" or "color(srgb r g b / a)") and composite over white.
      const rgb = (css: string) => {
        const nums = (css.match(/[\d.]+/g) || []).map(Number);
        const srgb = css.startsWith('color(');
        const [r, g, b] = nums.slice(0, 3).map(v => srgb ? v * 255 : v);
        const a = nums.length > 3 ? nums[3] : 1;
        return [r, g, b].map(v => Math.round(v * a + 255 * (1 - a)));
      };
      return nodes.map((node, i) => {
        const style = getComputedStyle(node);
        const color = style.getPropertyValue(document.documentElement.dataset.theme === 'dark' ? '--sec-dark' : '--sec').trim();
        const alpha = bands[i].classList.contains('current') ? 1 : .8;
        const expected = [1, 3, 5].map(offset => Math.round(parseInt(color.slice(offset, offset + 2), 16) * alpha + 255 * (1 - alpha)));
        const observed = rgb(getComputedStyle(bands[i]).backgroundColor);
        return { key: node.dataset.sectionKey, color, expected, observed, bandKey: bands[i].dataset.sectionKey };
      });
    });
    expect(actual.map(item => item.key)).toEqual(order);
    expect(new Set(actual.map(item => item.key))).toEqual(new Set(sections.map(item => item.key)));
    expect(actual[0].color).toBe(actual.at(-1)?.color);
    for (let i = 0; i < actual.length; i++) {
      expect(actual[i].bandKey).toBe(actual[i].key);
      expect(actual[i].color).toMatch(/^#[0-9a-f]{6}$/i);
      expect(actual[i].observed.map((value, channel) => Math.abs(value - actual[i].expected[channel]) <= 2)).toEqual([true, true, true]);
      if (i) expect(actual[i].color).not.toBe(actual[i - 1].color);
    }
  });
}

for (const viewport of [{ width: 375, height: 812 }, { width: 1440, height: 900 }]) {
  test(`POST sections fit one slot at ${viewport.width}`, async ({ page }) => {
    await page.setViewportSize(viewport);
    await page.goto('/');
    await page.evaluate(() => document.fonts.ready);
    for (const id of ['education', 'awards']) {
      const dimensions = await page.locator(`#${id}`).evaluate(section => {
        const box = section.getBoundingClientRect();
        const panel = section.querySelector('.post-panel')!.getBoundingClientRect();
        return { slots: section.matches('.feature-slot') ? 1 : section.querySelectorAll('.feature-slot').length, sectionHeight: box.height, panelTop: panel.top - box.top, panelBottom: box.bottom - panel.bottom };
      });
      expect(dimensions.slots).toBe(1);
      expect(Math.abs(dimensions.sectionHeight - viewport.height)).toBeLessThanOrEqual(1);
      expect(dimensions.panelTop).toBeGreaterThanOrEqual(0);
      expect(dimensions.panelBottom).toBeGreaterThanOrEqual(0);
    }
  });
}
