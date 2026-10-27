import { test, expect, type Page } from '@playwright/test';

// Scroll-glide tests wait on state, not wall-clock time, so a busy machine only makes them slower, never red.
const SETTLE = { timeout: 10_000 };
async function ready(page: Page) {
  await page.goto('/');
  await page.evaluate(() => document.fonts.ready);
  await expect(page.locator('.rail-dot').first()).toBeAttached();
}
const scrollTop = (page: Page) => page.evaluate(() => Math.round(scrollY));

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
      return { widths: [document.documentElement.scrollWidth, innerWidth], heights: slots.map(s => s.getBoundingClientRect().height), centers: dots.map(d => d.getBoundingClientRect().top + 12), railRight: document.querySelector('.progress-rail')!.getBoundingClientRect().right, logo: (document.querySelector('.site-header nav') ?? document.body).getBoundingClientRect().toJSON(), readout: document.querySelector('.rail-readout')!.getBoundingClientRect().toJSON() };
    });
    expect(geometry.widths[0]).toBeLessThanOrEqual(geometry.widths[1]);
    expect(viewport.width - geometry.railRight).toBeGreaterThanOrEqual(14);
    // Phones have no readout (it would cover content); on laptops it stays clear of the menu.
    if (geometry.readout.width) expect(geometry.readout.left >= geometry.logo.right || geometry.readout.top >= geometry.logo.bottom).toBeTruthy();
    else expect(viewport.width).toBeLessThan(900);
    geometry.heights.forEach(h => expect(Math.abs(h - geometry.heights[0])).toBeLessThanOrEqual(1));
    const step = geometry.centers[1] - geometry.centers[0];
    geometry.centers.forEach((c, i) => expect(Math.abs(c - geometry.centers[0] - step * i)).toBeLessThanOrEqual(1));
    for (let i = 0; i < await dots.count(); i++) {
      await dots.nth(i).click();
      await expect.poll(() => page.evaluate(index => Math.abs(document.querySelectorAll('.milestone-anchor')[index].getBoundingClientRect().top), i), { timeout: 10_000 }).toBeLessThanOrEqual(1);
      await expect(page.locator('.rail-dot.current')).toHaveCount(1);
      await expect(dots.nth(i)).toHaveClass(/current/);
      await expect.poll(async () => slots.nth(i).evaluate(slot => { const object = slot.querySelector<HTMLElement>('.proof-card:last-child,.project-card,.skill-card:last-child,.job-row,.cred-item:last-child') || slot; const st = getComputedStyle(object); return st.opacity === '1' && (st.transform === 'none' || st.transform === 'matrix(1, 0, 0, 1, 0, 0)' || st.transform === 'matrix3d(1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1)'); }), { timeout: 3000 }).toBeTruthy();
      const state = await slots.nth(i).evaluate(slot => {
        const object = slot.matches('.hero,.hl-slot,.project-slot,.skill-slot,.job-page,#education,#contact') ? slot.querySelector<HTMLElement>('.proof-card:last-child,.project-card,.skill-card:last-child,.job-row,.cred-item:last-child') || slot : slot;
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

for (const viewport of [{ width: 375, height: 812 }, { width: 1440, height: 900 }]) {
  test(`project cards stay visible just past their landing at ${viewport.width}`, async ({ page }) => {
    await page.setViewportSize(viewport);
    await page.goto('/');
    const count = await page.locator('.project-slot').count();
    for (let i = 0; i < count; i++) {
      // Stop a little past the slot's top, where the exit drift has just begun.
      await page.evaluate(index => { const s = document.querySelectorAll<HTMLElement>('.project-slot')[index]; window.scrollTo(0, s.getBoundingClientRect().top + scrollY + 20); }, i);
      await page.waitForTimeout(1200);
      const opacity = await page.locator('.project-slot').nth(i).locator('.project-card').evaluate(c => Number(getComputedStyle(c).opacity));
      expect(opacity, `project ${i}`).toBeGreaterThan(.9);
    }
  });
}

test('resizing within a layout keeps the reader on the same settled milestone', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/');
  const dots = page.locator('.rail-dot');
  const labels = await dots.evaluateAll(d => d.map(x => x.getAttribute('aria-label')));
  const index = labels.indexOf('Inductor & Firmware Checker');
  await dots.nth(index).click();
  await page.waitForTimeout(1500);
  for (const [width, height] of [[1280, 720], [1100, 800], [1440, 900]]) {
    await page.setViewportSize({ width, height });
    await page.waitForTimeout(1500);
    await expect(dots.nth(index)).toHaveClass(/current/);
    const card = await page.locator('.feature-slot').nth(index).locator('.project-card').evaluate(c => ({ opacity: Number(getComputedStyle(c).opacity), transform: getComputedStyle(c).transform }));
    expect(card.opacity).toBeGreaterThan(.98);
    expect(['none', 'matrix(1, 0, 0, 1, 0, 0)', 'matrix3d(1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1)']).toContain(card.transform);
  }
});

test('stopping near the top of a page snaps onto it', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/');
  const top = await page.locator('.feature-slot').nth(4).evaluate(s => s.getBoundingClientRect().top + scrollY);
  await page.mouse.move(700, 450);
  await page.evaluate(y => window.scrollTo(0, y + 60), top);
  await page.mouse.wheel(0, 1);
  await expect.poll(() => page.evaluate(y => Math.abs(scrollY - y), top), { timeout: 3000 }).toBeLessThanOrEqual(2);
});

for (const viewport of [{ width: 1440, height: 900 }, { width: 1000, height: 560 }]) {
  test(`the readout rides the fill tip from the first dot to the last at ${viewport.width}`, async ({ page }) => {
    await page.setViewportSize(viewport);
    await page.goto('/');
    await page.waitForTimeout(800);
    const measure = () => page.evaluate(() => {
      const rail = document.querySelector('.progress-rail .rail-track')!.getBoundingClientRect();
      const tip = rail.top + rail.height * Number(getComputedStyle(document.querySelector('.rail-fill')!).transform.split(',')[3] ?? 0);
      const r = document.querySelector('.rail-readout')!.getBoundingClientRect();
      return { railTop: rail.top, railBottom: rail.bottom, tip, top: r.top, bottom: r.bottom, center: (r.top + r.bottom) / 2 };
    });
    const dotCenter = (i: number) => page.evaluate(k => { const d = [...document.querySelectorAll('.rail-dot')].at(k)!.getBoundingClientRect(); return (d.top + d.bottom) / 2; }, i);
    const atTop = await measure();
    expect(Math.abs(atTop.center - await dotCenter(0))).toBeLessThanOrEqual(2);
    const mid = await page.evaluate(() => document.documentElement.scrollHeight / 2);
    await page.evaluate(y => window.scrollTo({ top: y, behavior: 'instant' }), mid);
    await page.waitForTimeout(600);
    const middle = await measure();
    expect(Math.abs(middle.center - middle.tip)).toBeLessThanOrEqual(2);
    await page.evaluate(() => window.scrollTo({ top: document.documentElement.scrollHeight, behavior: 'instant' }));
    await page.waitForTimeout(600);
    const atBottom = await measure();
    expect(Math.abs(atBottom.center - await dotCenter(-1))).toBeLessThanOrEqual(2);
  });
}

test('stopping halfway between pages settles onto a page', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/');
  await page.mouse.move(700, 450);
  const top = await page.locator('.feature-slot').nth(4).evaluate(s => s.getBoundingClientRect().top + scrollY);
  await page.evaluate(y => window.scrollTo(0, y + 450), top);
  await page.mouse.wheel(0, 1);
  await expect.poll(() => page.evaluate(() => {
    const tops = [...document.querySelectorAll<HTMLElement>('.feature-slot')].map(s => s.getBoundingClientRect().top + scrollY);
    return Math.min(...tops.map(t => Math.abs(t - scrollY)));
  }), { timeout: 3000 }).toBeLessThanOrEqual(2);
});

test('the footer is still reachable with hard snap', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/');
  await page.evaluate(() => window.scrollTo({ top: document.documentElement.scrollHeight, behavior: 'instant' }));
  await page.waitForTimeout(800);
  const footer = await page.locator('.site-footer').boundingBox();
  expect(footer!.y + footer!.height).toBeLessThanOrEqual(900 + 1);
});

test('every section band, including the first and last, fits inside the rail', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/');
  const fit = await page.evaluate(() => {
    const rail = document.querySelector('.progress-rail')!.getBoundingClientRect();
    return [...document.querySelectorAll('.rail-band')].map(b => { const r = b.getBoundingClientRect(); return r.top >= rail.top - 1 && r.bottom <= rail.bottom + 1; });
  });
  expect(fit.every(Boolean)).toBeTruthy();
});

test('arrow keys move exactly one page, smoothly, without stutter', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await ready(page);
  const tops = await page.$$eval('.feature-slot', s => s.map(x => Math.round(x.getBoundingClientRect().top + scrollY)));
  await page.keyboard.press('ArrowDown');
  await expect.poll(() => scrollTop(page), SETTLE).toBe(tops[1]);
  await page.keyboard.press('ArrowDown');
  await expect.poll(() => scrollTop(page), SETTLE).toBe(tops[2]);
  await page.keyboard.press('ArrowUp');
  await expect.poll(() => scrollTop(page), SETTLE).toBe(tops[1]);
});

test('buffered arrow presses glide several pages and land exactly on one', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await ready(page);
  const tops = await page.$$eval('.feature-slot', s => s.map(x => Math.round(x.getBoundingClientRect().top + scrollY)));
  for (let k = 0; k < 3; k++) { await page.keyboard.press('ArrowDown'); await page.waitForTimeout(60); }
  await expect.poll(() => scrollTop(page), SETTLE).toBe(tops[3]);
});

test('reversing mid-glide and holding a key both settle exactly on a page', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await ready(page);
  const tops = await page.$$eval('.feature-slot', s => s.map(x => Math.round(x.getBoundingClientRect().top + scrollY)));
  const onAPage = () => page.evaluate(t => t.includes(Math.round(scrollY)), tops);
  for (let k = 0; k < 3; k++) { await page.keyboard.press('ArrowDown'); await page.waitForTimeout(40); }
  await page.waitForTimeout(150);
  await page.keyboard.press('ArrowUp');
  await expect.poll(onAPage, SETTLE).toBeTruthy();
  const afterReverse = await scrollTop(page);
  expect(afterReverse).toBeLessThan(tops[3]);
  // A held key (auto-repeat) never runs more than MAX_LEAD pages past where the glide was when released.
  for (let k = 0; k < 20; k++) { await page.keyboard.press('ArrowDown'); await page.waitForTimeout(30); }
  await expect.poll(onAPage, SETTLE).toBeTruthy();
});

for (const viewport of [{ width: 1000, height: 560 }, { width: 1280, height: 720 }, { width: 1440, height: 900 }]) {
  test(`the header rule stops short of the rail readout at ${viewport.width}`, async ({ page }) => {
    await page.setViewportSize(viewport);
    await page.goto('/');
    await page.waitForTimeout(600);
    const g = await page.evaluate(() => {
      const h = document.querySelector('.site-header')!; const r = document.querySelector('.rail-readout')!.getBoundingClientRect();
      const b = h.getBoundingClientRect(); const hero = document.querySelector('.hero-copy, .hero')!.getBoundingClientRect();
      return { ruleRight: b.right, ruleWidth: parseFloat(getComputedStyle(h).borderBottomWidth), readoutLeft: r.left, ruleLeft: b.left };
    });
    expect(g.ruleWidth).toBeGreaterThan(0);
    expect(g.ruleRight).toBeLessThan(g.readoutLeft - 8);
  });
}

test('on laptops the rail is the scrollbar: native bar hidden, dragging the rail scrolls', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/');
  await page.waitForTimeout(800);
  // The native scrollbar takes no space.
  expect(await page.evaluate(() => innerWidth - document.documentElement.clientWidth)).toBe(0);
  const rail = (await page.locator('.progress-rail').boundingBox())!;
  const x = rail.x + rail.width / 2 + 10; // beside the line, inside the grab zone, away from the dots' centers
  await page.mouse.move(x, rail.y + 4);
  await page.mouse.down();
  await page.mouse.move(x, rail.y + rail.height / 2, { steps: 8 });
  await page.mouse.up();
  await page.waitForTimeout(400);
  const percent = await page.locator('#scroll-percent').textContent();
  expect(Number(percent!.replace('%', ''))).toBeGreaterThanOrEqual(45);
  expect(Number(percent!.replace('%', ''))).toBeLessThanOrEqual(55);
});

test('menu links glide to their section instead of jumping', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await ready(page);
  const sectionTop = () => page.locator('#experience').evaluate(s => Math.round(s.getBoundingClientRect().top + scrollY));
  const target = await sectionTop();
  // Record the scroll position on every frame, so the check doesn't depend on sampling at a lucky moment.
  await page.evaluate(() => { const w = window as unknown as { ys: number[] }; w.ys = []; const tick = () => { w.ys.push(Math.round(scrollY)); requestAnimationFrame(tick); }; tick(); });
  await page.locator('.site-header nav a[href="/#experience"]').click();
  // It lands exactly on the section...
  await expect.poll(() => scrollTop(page), SETTLE).toBe(target);
  expect(await scrollTop(page)).toBe(await sectionTop());
  // ...and got there through in-between positions (an animation, not a jump).
  const between = await page.evaluate(t => new Set((window as unknown as { ys: number[] }).ys.filter(y => y > 0 && y < t)).size, target);
  expect(between).toBeGreaterThan(2);
});

test('the address bar follows the section being read, and deep links still work', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/');
  await page.waitForTimeout(600);
  const historyLength = await page.evaluate(() => history.length);
  for (const [id, hash] of [['projects', '#projects'], ['education', '#education'], ['contact', '#contact']]) {
    await page.evaluate(i => window.scrollTo({ top: document.getElementById(i)!.getBoundingClientRect().top + scrollY, behavior: 'instant' }), id);
    await expect.poll(() => page.evaluate(() => location.hash), { timeout: 2000 }).toBe(hash);
  }
  await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }));
  await expect.poll(() => page.evaluate(() => location.hash), { timeout: 2000 }).toBe('');
  // replaceState: scrolling never piles up history entries.
  expect(await page.evaluate(() => history.length)).toBe(historyLength);
  // A deep link lands on its section and keeps its hash.
  await page.goto('/#awards');
  await page.waitForTimeout(1200);
  expect(await page.evaluate(() => location.hash)).toBe('#awards');
  const top = await page.locator('#awards').evaluate(s => Math.round(s.getBoundingClientRect().top));
  expect(Math.abs(top)).toBeLessThanOrEqual(2);
});

test('each dot tooltip names the same place the readout shows when you land there', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/');
  const dots = page.locator('.rail-dot');
  const titles = await dots.evaluateAll(d => d.map(x => x.getAttribute('data-title')));
  expect(titles[0]).toBe('Home');
  await expect(page.locator('#rail-section')).toHaveText('Home');
  for (const i of [1, titles.length - 1]) {
    await dots.nth(i).click();
    await expect(dots.nth(i)).toHaveClass(/current/);
    await expect(page.locator('#rail-section')).toHaveText(titles[i]!);
  }
  for (const title of titles) expect(title, 'tooltips use short names').not.toMatch(/·/);
});

// The phone readout bubble used to sit on top of headings and screenshots while scrolling.
test('phones never show the readout over the content, even while scrolling', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await ready(page);
  // The rail marks itself as scrolling while the page moves; hold that state so the check doesn't race its timer.
  await page.evaluate(() => document.querySelector('.progress-rail')!.classList.add('is-scrolling'));
  await expect(page.locator('.rail-readout')).toBeHidden();
});
