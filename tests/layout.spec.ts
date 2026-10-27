import { test, expect } from '@playwright/test';

// Layout checks across window sizes. The earlier cleanups were verified as "pixel-identical", which keeps existing
// layout bugs by design; these checks look at the layout itself: things fit, fill, don't overlap and don't touch.
// Motion is off so every element sits at its final position.
const viewports = [
  [375, 812], [375, 560], [430, 932], [700, 800], [899, 700],
  [900, 700], [1000, 560], [1280, 720], [1440, 900], [1920, 1080],
] as const;

for (const [width, height] of viewports) {
  test(`layout holds at ${width}x${height}`, async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.setViewportSize({ width, height });
    await page.goto('/');
    await page.evaluate(() => document.fonts.ready);
    // Lazy screenshots below the fold would never load on their own; load them all so their real size is measured.
    await page.evaluate(async () => {
      document.querySelectorAll('img[loading="lazy"]').forEach(i => i.setAttribute('loading', 'eager'));
      await Promise.race([Promise.all([...document.images].map(i => i.decode().catch(() => undefined))), new Promise(r => setTimeout(r, 5000))]);
    });
    const issues = await page.evaluate(() => {
      const out: string[] = [];
      const name = (e: Element) => `${e.tagName.toLowerCase()}${e.id ? '#' + e.id : ''}${e.classList.length ? '.' + [...e.classList].join('.') : ''}`;
      const where = (e: Element) => (e.closest<HTMLElement>('[data-milestone]')?.dataset.milestone ?? '') + ' › ' + name(e);
      type Box = { l: number; t: number; r: number; b: number; w: number; h: number };
      const cache = new Map<Element, Box>();
      const box = (e: Element) => { let v = cache.get(e); if (!v) { const r = e.getBoundingClientRect(); v = { l: r.left + scrollX, t: r.top + scrollY, r: r.right + scrollX, b: r.bottom + scrollY, w: r.width, h: r.height }; cache.set(e, v); } return v; };
      const shown = (e: Element) => {
        const r = e.getBoundingClientRect(); if (!r.width || !r.height) return false;
        for (let n: Element | null = e; n; n = n.parentElement) { const cs = getComputedStyle(n); if (cs.visibility === 'hidden' || cs.display === 'none' || Number(cs.opacity) === 0) return false; }
        return true;
      };
      // Page chrome is checked by its own tests; the chat panel is closed.
      const skip = (e: Element) => !!e.closest('.progress-rail, .chat, .grid-glow, .skip-link, script, style, [aria-hidden="true"]');
      const all = [...document.querySelectorAll('body *')].filter(e => !skip(e) && shown(e));
      const visible = new Set(all);
      const isBox = (e: Element) => {
        if (e.matches('section, .feature-slot, .wrap, html, body, main')) return false;
        const cs = getComputedStyle(e);
        return cs.backgroundColor !== 'rgba(0, 0, 0, 0)' || parseFloat(cs.borderTopWidth) > 0 && parseFloat(cs.borderBottomWidth) > 0 || parseFloat(cs.borderTopLeftRadius) > 0 && e.childElementCount > 0;
      };
      const boxes = all.filter(isBox);
      const boxSet = new Set(boxes);

      // 1. A box contains everything inside it (screenshots cropped by their frame are fine).
      for (const b of boxes) {
        const B = box(b);
        for (const d of b.querySelectorAll('*')) {
          if (!visible.has(d) || d.closest('.project-media') && d !== b.querySelector('.project-media')) continue;
          const D = box(d);
          if (D.l < B.l - 1 || D.t < B.t - 1 || D.r > B.r + 1 || D.b > B.b + 1) { out.push(`spills: ${where(d)} outside ${name(b)}`); break; }
        }
      }

      // 2. Screenshots reach the bottom and right of their frame.
      for (const m of document.querySelectorAll('.project-media.has-shot')) {
        const img = m.querySelector('img'); if (!img || !shown(img)) continue;
        const M = box(m), I = box(img);
        if (M.b - I.b > 2 || M.r - I.r > 2) out.push(`gap under/beside screenshot: ${where(m)} (${Math.round(M.b - I.b)}px, ${Math.round(M.r - I.r)}px)`);
      }

      // 3. Text never overlaps other text or a box it isn't inside.
      const texts = all.filter(e => [...e.childNodes].some(n => n.nodeType === 3 && n.textContent!.trim()) && !e.closest('svg, .project-media'));
      const hit = (a: Box, b: Box) => Math.min(a.r, b.r) - Math.max(a.l, b.l) > 2 && Math.min(a.b, b.b) - Math.max(a.t, b.t) > 2;
      const slotOf = (e: Element) => e.closest('.feature-slot, header, footer');
      for (let i = 0; i < texts.length; i++) {
        const A = box(texts[i]);
        for (let j = i + 1; j < texts.length; j++) {
          if (slotOf(texts[i]) !== slotOf(texts[j]) && !texts[j].closest('header') && !texts[i].closest('header')) continue;
          if (texts[i].contains(texts[j]) || texts[j].contains(texts[i])) continue;
          if (hit(A, box(texts[j]))) out.push(`text overlaps text: ${where(texts[i])} / ${name(texts[j])}`);
        }
        for (const b of boxes) if (!b.contains(texts[i]) && !texts[i].contains(b) && hit(A, box(b))) out.push(`text overlaps box: ${where(texts[i])} / ${name(b)}`);
      }

      // 4. Sibling boxes (cards, rows) never touch.
      for (const b of boxes) {
        const sib = b.nextElementSibling; if (!sib || !boxSet.has(sib)) continue;
        const A = box(b), S = box(sib);
        const gap = Math.max(S.l - A.r, A.l - S.r, S.t - A.b, A.t - S.b);
        if (gap < 6) out.push(`boxes touch: ${where(b)} / ${name(sib)} (${Math.round(gap)}px)`);
      }

      // 5. Phones: buttons are big enough to tap.
      if (innerWidth < 900) for (const e of all.filter(e => e.matches('button, .button'))) {
        const E = box(e); if (E.h < 24 || E.w < 24) out.push(`too small to tap: ${where(e)} (${Math.round(E.w)}x${Math.round(E.h)})`);
      }

      // 6. Text is readable.
      for (const e of texts) { const fs = parseFloat(getComputedStyle(e).fontSize); if (fs < 10) out.push(`text under 10px: ${where(e)} (${fs}px)`); }

      return [...new Set(out)];
    });
    expect(issues, issues.slice(0, 25).join('\n')).toEqual([]);
  });
}
