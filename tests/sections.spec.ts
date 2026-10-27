import { test, expect } from '@playwright/test';
import { sections } from '../src/data/sections';

const order = ['contact', 'highlights', 'projects', 'process', 'skills', 'jobs', 'education', 'awards', 'contact'];

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

for (const viewport of [{ width: 375, height: 812 }, { width: 1000, height: 560 }, { width: 1280, height: 720 }, { width: 1440, height: 900 }]) {
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
      // Laptops need visible breathing room above the heading and below the list, not just a fit.
      const room = viewport.width >= 768 ? 24 : 0;
      expect(dimensions.panelBottom).toBeGreaterThanOrEqual(room);
      expect(dimensions.headingTop).toBeGreaterThanOrEqual(room);
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

for (const viewport of [{ width: 375, height: 812 }, { width: 1000, height: 560 }, { width: 1280, height: 720 }, { width: 1440, height: 900 }]) {
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
      const room = viewport.width >= 768 ? 24 : 0;
      expect(p.top).toBeGreaterThanOrEqual(room);
      expect(p.bottom).toBeLessThanOrEqual(p.height - room);
    }
  });
}

for (const viewport of [{ width: 375, height: 812 }, { width: 1440, height: 900 }]) {
  test(`project cards fit their slot below the heading at ${viewport.width}`, async ({ page }) => {
    await page.setViewportSize(viewport);
    await page.goto('/');
    await page.evaluate(() => document.fonts.ready);
    // Layout offsets ignore entrance transforms, so this checks the settled layout.
    const slots = await page.$$eval('.project-slot', list => list.map(s => {
      const card = s.querySelector<HTMLElement>('.project-card')!;
      const intro = s.querySelector<HTMLElement>('.project-intro');
      return { top: card.offsetTop, bottom: card.offsetTop + card.offsetHeight, introBottom: intro ? intro.offsetTop + intro.offsetHeight : 0, height: s.clientHeight };
    }));
    for (const s of slots) {
      expect(s.top).toBeGreaterThanOrEqual(s.introBottom);
      expect(s.bottom).toBeLessThanOrEqual(s.height);
    }
  });
}

for (const viewport of [{ width: 375, height: 812 }, { width: 1000, height: 560 }, { width: 1280, height: 720 }, { width: 1440, height: 900 }]) {
  test(`Highlights, How I build and Skills pages fit their slot at ${viewport.width}`, async ({ page }) => {
    await page.setViewportSize(viewport);
    await page.goto('/');
    await page.evaluate(() => document.fonts.ready);
    // Layout offsets ignore entrance transforms, so this measures the settled layout.
    const slots = await page.$$eval('.hl-slot,.skill-slot', list => list.map(s => {
      const kids = ([...s.children] as HTMLElement[]).filter(k => !k.matches(".milestone-anchor"));
      const cards = [...s.querySelectorAll<HTMLElement>('.proof-card,.skill-card')];
      return { cards: cards.length, top: kids[0].offsetTop, bottom: Math.max(...kids.map(k => k.offsetTop + k.offsetHeight), ...cards.map(c => c.offsetTop + c.offsetHeight)), height: s.clientHeight, overflowX: Math.max(0, ...cards.map(c => c.offsetLeft + c.offsetWidth)) - s.clientWidth };
    }));
    // Highlights intro + proof cards, then How I build (2 pages), then Skills (2 pages).
    expect(slots.map(s => s.cards)).toEqual([0, 4, 2, 2, 2, 2]);
    for (const s of slots) {
      const room = viewport.width >= 768 ? 24 : 0;
      expect(s.top).toBeGreaterThanOrEqual(room);
      expect(s.bottom).toBeLessThanOrEqual(s.height - room);
      expect(s.overflowX).toBeLessThanOrEqual(0);
    }
  });
}

// A friend's iPhone (Chrome, larger text) clipped the hero top and bottom: slots were a fixed screen tall with centered content.
test('on a short phone no screen clips its content; a screen grows instead', async ({ page }) => {
  // Reduced motion shows every item at its landed position (scenes start items off to the side).
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.setViewportSize({ width: 375, height: 560 });
  await page.goto('/');
  await page.evaluate(() => document.fonts.ready);
  const clipped = await page.evaluate(() => [...document.querySelectorAll<HTMLElement>('.feature-slot')].flatMap(slot => {
    const box = slot.getBoundingClientRect();
    if (box.height < innerHeight - 1) return [`${slot.dataset.milestone} shorter than a screen`];
    const out = [...slot.querySelectorAll<HTMLElement>('*')].filter(e => {
      const r = e.getBoundingClientRect();
      return r.width > 0 && r.height > 0 && getComputedStyle(e).visibility !== 'hidden' && (r.top < box.top - 1 || r.bottom > box.bottom + 1);
    });
    return out.length ? [`${slot.dataset.milestone}: ${out.length} elements outside`] : [];
  }));
  expect(clipped).toEqual([]);
});

// One layout switch at 900px: below it the phone layout (no header, photo above the name), from 900 the laptop layout.
// (Replaces a 768–899px header-clearance test: that hybrid band no longer exists.)
for (const [width, laptop] of [[899, false], [900, true]] as const) {
  test(`${width}px uses the ${laptop ? 'laptop' : 'phone'} layout`, async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.setViewportSize({ width, height: 800 });
    await page.goto('/');
    const g = await page.evaluate(() => {
      const photo = document.querySelector('.hero .portrait-unit')!.getBoundingClientRect();
      const name = document.querySelector('.hero h1')!.getBoundingClientRect();
      return { header: getComputedStyle(document.querySelector('.site-header')!).display !== 'none', beside: name.left >= photo.right - 1 };
    });
    expect(g).toEqual({ header: laptop, beside: laptop });
  });
}

// With site-wide hard snap, a case study's only snap point was the footer, so it opened scrolled to the bottom.
test('a case-study page opens at the top and scrolls freely', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/projects/solid-tree/');
  await page.waitForTimeout(800);
  expect(await page.evaluate(() => scrollY)).toBe(0);
  expect(await page.evaluate(() => getComputedStyle(document.documentElement).scrollSnapType)).toBe('none');
});

test('highlight numbers finish counting after the window crosses the phone/laptop breakpoint', async ({ page }) => {
  const values = () => page.$$eval('.proof-value', els => els.map(e => e.textContent));
  const final = ['Millions', '22', '30,000', '4.0'];
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/');
  await page.evaluate(() => scrollTo(0, document.querySelector('.hl-proofs')!.getBoundingClientRect().top + scrollY));
  await expect.poll(values).toEqual(final);
  for (const width of [800, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    // Let the scenes rebuild and the reader settle back on the slot before reading the numbers.
    await page.waitForTimeout(2000);
    expect(await values()).toEqual(final);
  }
});
