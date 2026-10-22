import { test, expect } from '@playwright/test';

for (const viewport of [{ width: 375, height: 812 }, { width: 1440, height: 900 }]) {
  test(`rail milestones ${viewport.width}`, async ({ page }) => {
    await page.setViewportSize(viewport);
    await page.goto('/');
    await page.evaluate(() => document.fonts.ready);
    const dots = page.locator('.rail-dot');
    const slots = page.locator('.feature-slot');
    await expect(dots).toHaveCount(await slots.count());
    const geometry = await page.evaluate(() => {
      const slots = [...document.querySelectorAll<HTMLElement>('.feature-slot')];
      const dots = [...document.querySelectorAll<HTMLElement>('.rail-dot')];
      return { widths: [document.documentElement.scrollWidth, innerWidth], heights: slots.map(s => s.getBoundingClientRect().height), centers: dots.map(d => d.getBoundingClientRect().top + 12), railRight: document.querySelector('.progress-rail')!.getBoundingClientRect().right, logo: document.querySelector('.brand')!.getBoundingClientRect().toJSON(), readout: document.querySelector('.rail-readout')!.getBoundingClientRect().toJSON() };
    });
    expect(geometry.widths[0]).toBeLessThanOrEqual(geometry.widths[1]);
    expect(viewport.width - geometry.railRight).toBeGreaterThanOrEqual(14);
    expect(geometry.readout.left >= geometry.logo.right || geometry.readout.top >= geometry.logo.bottom).toBeTruthy();
    geometry.heights.forEach(h => expect(Math.abs(h - geometry.heights[0])).toBeLessThanOrEqual(1));
    const step = geometry.centers[1] - geometry.centers[0];
    geometry.centers.forEach((c, i) => expect(Math.abs(c - geometry.centers[0] - step * i)).toBeLessThanOrEqual(1));
    for (let i = 0; i < await dots.count(); i++) {
      await dots.nth(i).click();
      await expect.poll(() => page.evaluate(index => Math.abs(document.querySelectorAll('.milestone-anchor')[index].getBoundingClientRect().top), i), { timeout: 10_000 }).toBeLessThanOrEqual(1);
      await expect(page.locator('.rail-dot.current')).toHaveCount(1);
      await expect(dots.nth(i)).toHaveClass(/current/);
      await expect.poll(async () => slots.nth(i).evaluate(slot => { const object = slot.querySelector<HTMLElement>('.metric,.project-card,.pinout-row,.job-row,.cred-item:last-child') || slot; const st = getComputedStyle(object); return st.opacity === '1' && (st.transform === 'none' || st.transform === 'matrix(1, 0, 0, 1, 0, 0)' || st.transform === 'matrix3d(1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1)'); }), { timeout: 3000 }).toBeTruthy();
      const state = await slots.nth(i).evaluate(slot => {
        const object = slot.matches('.hero,.chip-section,.metric-slot,.project-slot,.pin-slot,.job-page,#education,#contact') ? slot.querySelector<HTMLElement>('.metric,.project-card,.pinout-row,.job-row,.cred-item:last-child') || slot : slot;
        const style = getComputedStyle(object);
        return { transform: style.transform, opacity: Number(style.opacity) };
      });
      expect(state.opacity).toBeGreaterThanOrEqual(.98);
      expect(['none', 'matrix(1, 0, 0, 1, 0, 0)', 'matrix3d(1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1)']).toContain(state.transform);
    }
    await page.goto('/');
    let focusedDot = false;
    for (let tab = 0; tab < 12; tab++) {
      await page.keyboard.press('Tab');
      focusedDot = await page.evaluate(() => document.activeElement?.classList.contains('rail-dot') ?? false);
      if (focusedDot) break;
    }
    expect(focusedDot).toBeTruthy();
    await page.keyboard.press('Enter');
    await expect.poll(() => page.evaluate(() => Math.abs(document.querySelector('.milestone-anchor')!.getBoundingClientRect().top)), { timeout: 10_000 }).toBeLessThanOrEqual(1);
  });
}

test('crossing the phone/laptop breakpoint keeps the reader on the same milestone', async ({ page }) => {
  await page.setViewportSize({ width: 700, height: 1100 });
  await page.goto('/');
  const dots = page.locator('.rail-dot');
  const labels = await dots.evaluateAll(d => d.map(x => x.getAttribute('aria-label')));
  const index = labels.indexOf('solid-tree');
  await dots.nth(index).click();
  await expect(dots.nth(index)).toHaveClass(/current/);
  await page.waitForTimeout(800);
  for (const width of [900, 700]) {
    await page.setViewportSize({ width, height: 1100 });
    await page.waitForTimeout(1500);
    await expect(dots.nth(index)).toHaveClass(/current/);
    const card = await page.locator('.project-slot').nth(0).locator('.project-card').evaluate(c => ({ top: c.getBoundingClientRect().top, opacity: getComputedStyle(c).opacity }));
    expect(card.top).toBeGreaterThanOrEqual(0);
    expect(card.top).toBeLessThan(1100);
    expect(Number(card.opacity)).toBeGreaterThan(.98);
  }
});
