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

test('outbound links open in a new tab; phone, email and in-page links do not', async ({ page }) => {
  await page.goto('/');
  const links = await page.$$eval('a[href]', as => as.map(a => ({ href: a.getAttribute('href')!, target: a.getAttribute('target') })));
  for (const l of links) {
    const inPage = l.href.startsWith('#') || l.href.startsWith('/#') || l.href === '/';
    const app = l.href.startsWith('tel:') || l.href.startsWith('mailto:');
    if (inPage || app) expect(l.target, l.href).toBeNull();
    else expect(l.target, l.href).toBe('_blank');
  }
});

test('clicking anywhere on a project card opens its case study in a new tab', async ({ page, context }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/');
  const card = page.locator('.project-card').first();
  await card.scrollIntoViewIfNeeded();
  await page.waitForTimeout(1500);
  // Click the middle of the screenshot by position: the stretched title link covers the card, which is the point.
  const box = (await card.locator('.project-media').boundingBox())!;
  const [popup] = await Promise.all([context.waitForEvent('page'), page.mouse.click(box.x + box.width / 2, box.y + box.height / 2)]);
  await popup.waitForLoadState();
  expect(popup.url()).toMatch(/\/projects\/[^/]+\/$/);
});

test('no hover rule moves or resizes anything', async ({ page }) => {
  await page.goto('/');
  const offenders = await page.evaluate(() => {
    const bad: string[] = [];
    const walk = (rules: CSSRuleList) => { for (const r of Array.from(rules)) {
      if (r instanceof CSSStyleRule && r.selectorText.includes(':hover')) {
        for (const prop of ['transform', 'scale', 'translate', 'rotate', 'width', 'height', 'margin', 'padding', 'top', 'left', 'font-size']) if (r.style.getPropertyValue(prop)) bad.push(`${r.selectorText} { ${prop} }`);
      } else if ('cssRules' in r) walk((r as CSSGroupingRule).cssRules);
    } };
    for (const sheet of Array.from(document.styleSheets)) { try { walk(sheet.cssRules); } catch {} }
    return bad;
  });
  expect(offenders).toEqual([]);
});
