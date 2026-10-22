import { test, expect } from '@playwright/test';

const hrefs = ['tel:+14084061832', 'mailto:timotholt@gmail.com', 'https://www.linkedin.com/in/timotholt', 'https://github.com/timotholt'];
for (const viewport of [{ width: 375, height: 812 }, { width: 1440, height: 900 }]) {
  test(`full contact information fits both slots at ${viewport.width}`, async ({ page }) => {
    await page.setViewportSize(viewport);
    await page.goto('/');
    await page.evaluate(() => document.fonts.ready);
    for (const selector of ['.hero', '#contact']) {
      const section = page.locator(selector);
      for (const href of hrefs) await expect(section.locator(`a[href="${href}"]`)).toBeVisible();
      const bounds = await section.evaluate(el => {
        const box = el.getBoundingClientRect();
        const content = [...el.querySelectorAll('h1,h2,p,.contact-list,.hero-actions,.contact-identity')].map(node => node.getBoundingClientRect());
        return { height: box.height, viewport: innerHeight, contained: content.every(rect => rect.top >= box.top - 1 && rect.bottom <= box.bottom + 1) };
      });
      expect(Math.abs(bounds.height - bounds.viewport)).toBeLessThanOrEqual(1);
      expect(bounds.contained).toBeTruthy();
    }
    if (viewport.width >= 900) {
      const overlap = await page.evaluate(() => {
        const photo = document.querySelector('.hero .portrait')!.getBoundingClientRect();
        const text = document.querySelector('.hero-copy')!.getBoundingClientRect();
        return photo.right > text.left || photo.left >= text.left;
      });
      expect(overlap).toBeFalsy();
    }
  });
}
