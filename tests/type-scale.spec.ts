import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { test, expect } from '@playwright/test';

// type.css is the only stylesheet that sets a font size (docs/TYPE-SCALE.md): everything else picks a role, so the
// one root size resizes the whole site. Elsewhere only `font: inherit` is allowed.
const dir = join(process.cwd(), 'src/styles');

// Deliberate exceptions: "file: declaration" exactly as written, with the reason.
const allowlist = new Set<string>([]);

test('only type.css sets font sizes', () => {
  const offenders: string[] = [];
  for (const file of readdirSync(dir).filter(f => f.endsWith('.css') && f !== 'type.css')) {
    const css = readFileSync(join(dir, file), 'utf8').replace(/\/\*[\s\S]*?\*\//g, '');
    for (const [, prop, raw] of css.matchAll(/(?<![-\w])(font-size|font)\s*:\s*([^;}]+)/g)) {
      const value = raw.replace(/\s+/g, ' ').trim();
      const entry = `${file}: ${prop}: ${value}`;
      if (!(prop === 'font' && value === 'inherit') && !allowlist.has(entry)) offenders.push(entry);
    }
  }
  expect(offenders).toEqual([]);
});
