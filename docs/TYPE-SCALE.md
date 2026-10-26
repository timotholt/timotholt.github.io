# One shared type scale (laptop/desktop, 900px+)

## Problem

Every element sized itself with its own `clamp(min, min(Xvw, Ysvh), max)`, with different
coefficients and caps. The content column (`.wrap`) stops growing at 1000px, but the type kept
following the window. Text and column grew at different rates, so line breaks moved with window
size. Baseline on 2026-10-26: line breaks differed from 1440x900 in 5–10 text blocks at 920x700,
1000x560, 1100x800, 1280x720, and 1 block at 1750x1000+.

## Rule

On 900px+ windows, each section's content column is a size container. Every font size and
spacing inside it is a share of the column width (`cqi`), via shared tokens. The column itself is
the only thing that reacts to the window:

```
column = min(--col-max, window − 120px, --col-fit × 1svh)
```

`--col-fit` is the height cap: a short window narrows the column, and everything inside shrinks
with it, so a slot still fits one screen. Text and column scale together, so line breaks are the
same at every window size. Small readable floors (`max(14px, …)`) are the only exception; they
apply only on the smallest columns.

## Tokens (`tokens.css`)

Reference column 1000px; values in px at that width.

| Token | cqi | px @1000 | Used by |
| --- | --- | --- | --- |
| `--fs-display` | 9.9 | 99 | hero name, Highlights intro heading |
| `--fs-h2` | 7 | 70 | section headings, proof values, Contact heading |
| `--fs-h3` | 3.4 | 34 | hero title, skill / credential / project titles, contact name |
| `--fs-lead` | 2.4 | 24 | hero mantra |
| `--fs-body-l` | 2 | 20 | Highlights copy, proof labels, credential text, contact lists |
| `--fs-body` | 1.8 | 18 | hero pitch, skill summary, project text, contact intro |
| `--fs-small` | 1.3 | 13 | mono labels, tags, years |
| `--sp-1` / `--sp-2` / `--sp-3` | 1 / 2 / 3 | 10 / 20 / 30 | gaps and card padding |

Tokens are plain custom properties, so `cqi` resolves where they are used, against that
element's nearest container. Projects uses a wider column (1240px); it sets `--u` so its tokens
stay at the 1000px scale.

## Scope

- Desktop only (`min-width: 900px`). Phone layout and its sizes are unchanged.
- Sections: Hero, Highlights, Projects, Skills, Process, Work History, Education, Awards, Contact.
- Header and footer keep their own width rule (not scaled).
- Buttons keep fixed sizes (they don't wrap).

## Verification

Scratch script (not committed) loads the built site at 920x700, 1000x560, 1100x800, 1280x720,
1440x900, 1750x1000, 2200x1200, scrolls each slot into view, and checks:

1. The line count of every heading, paragraph, label and contact item is identical at all sizes.
2. Every slot is exactly one screen tall and its content stays inside.

Then `npm run check` and `npm test` (includes the slot-fit and readable-contact tests).

## Phase 2: one knob, every size, a guard test

Ask (Tim): change one value and everything resizes; nothing hard-coded left over.

1. **One knob.** `--scale` (default 1) in `tokens.css`. Every token multiplies by
   `--k = --scale × --text-zoom`. `--text-zoom` is the visitor's browser text size (root font size ÷
   16px), set by a two-line inline script in `Base.astro` before first paint; without JS it stays 1.
   Sizes still come from the column (`--u`), so line breaks stay put; `--k` changes all sizes
   by the same factor everywhere.
2. **Two kinds of token.**
   - *Content* (`--fs-display … --fs-small`): headings, body, labels inside sections, case studies
     and 404. Built on `--u`.
   - *Chrome* (`--fs-ui-*`): chat panel, progress rail, header/footer nav, eyebrows, buttons, spec
     tables. Built on `rem × --scale`; they don't belong to a column, so `rem` already follows the
     visitor's text size.
3. **Phone base (under 900px).** No size container there, so `--u` is the viewport:
   `clamp(3.75px, 1vw, 4.8px)`, i.e. 1% of the screen width, ramping from a 375px phone to a 480px
   one and then holding. Line breaks are the same on every phone from 375 to 480. The same content
   tokens get phone multipliers (below), so an element names a role once and both layouts follow.
   Phone headings are unified: every section heading is `--fs-h2` (projects and contact were
   bigger than skills/lists before).
4. **Guard test.** `tests/type-scale.spec.ts` reads every `src/styles/*.css` except `tokens.css`
   and fails on any `font-size` / `font` whose size isn't a `--fs-*` token, `inherit`, or an
   `em` / `%` share of its parent. Exceptions need an entry in the test's commented allowlist.

| Token | Laptop (× `--u` = 1% of column) | Phone (× `--u` = 1vw, 375–480) | px phone 375 / 480 |
| --- | --- | --- | --- |
| `--fs-giant` | 13 | 15 | 56 / 72 |
| `--fs-display` | 9.9 | 12 | 45 / 58 |
| `--fs-h2` | 7 | 8.5 | 32 / 41 |
| `--fs-h3` | 3.4 | 5 | 19 / 24 |
| `--fs-lead` | 2.4 | 4.5 | 17 / 22 |
| `--fs-body-l` | 2 (min 13px) | 3.9 | 14.6 / 18.7 |
| `--fs-body` | 1.8 (min 14px) | 3.7 | 13.9 / 17.8 |
| `--fs-contact` | 2 (min 16px) | 4.5 | 16.9 / 21.6 |
| `--fs-small` | 1.3 (min 10px) | 2.8 | 10.5 / 13 |

Chrome tokens (`rem`): `2xs` 8 · `xs` 9 · `sm` 10 · (base) 11 · `md` 12 · `lg` 13 · `xl` 15 ·
`base` 16 (body text, chat input) · `title` 22 · `display` 26 px at default text size.

## Result (2026-10-26)

Height caps (`--col-fit`, column px per 1svh): hero and default 143, Work History / Education /
Awards 119 (their pages run tallest), Projects 177 (= 143 × 1240/1000).

Floors: `--fs-body` 14px, `--fs-body-l` 13px, `--fs-small` 10px — about the old desktop minimums.

All slots fit with 24px+ room at every size. Line breaks are identical at all seven sizes, except
one project description at 920x700 and 1000x560: the Projects column drops to ~780–860px there,
so the 14px body floor applies instead of ~11–12px. Before this change, 5–10 blocks differed.
