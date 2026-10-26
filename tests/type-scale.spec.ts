import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { test, expect } from '@playwright/test';

// Every font size comes from the shared scale in tokens.css (docs/TYPE-SCALE.md), so one knob resizes the site.
// Allowed outside tokens.css: a --fs-* token, inherit, or an em / % share of the parent's size.
const dir = join(process.cwd(), 'src/styles');

// Deliberate exceptions: "file: declaration" exactly as written, with the reason.
const allowlist = new Set<string>([]);

test('no stylesheet hard-codes a font size outside the type scale', () => {
  const offenders: string[] = [];
  for (const file of readdirSync(dir).filter(f => f.endsWith('.css') && f !== 'tokens.css')) {
    const css = readFileSync(join(dir, file), 'utf8').replace(/\/\*[\s\S]*?\*\//g, '');
    for (const [, prop, raw] of css.matchAll(/(?<![-\w])(font-size|font)\s*:\s*([^;}]+)/g)) {
      const value = raw.replace(/\s+/g, ' ').trim();
      const ok = value.includes('var(--fs-') || value === 'inherit' || (prop === 'font-size' && /^[\d.]+(em|%)$/.test(value));
      const entry = `${file}: ${prop}: ${value}`;
      if (!ok && !allowlist.has(entry)) offenders.push(entry);
    }
  }
  expect(offenders).toEqual([]);
});
